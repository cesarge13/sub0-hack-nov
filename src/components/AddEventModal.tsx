import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar, User, Tag, Clock, FileText, Hash, Loader2, CheckCircle, Shield, ExternalLink, AlertCircle } from 'lucide-react';
import type { Event, EventType, Status } from '../types';
import { EVENT_TYPE_NAMES } from '../types/events';
import { computeFileHash } from '../utils/crypto/hashing';
import { uploadJson, uploadFile } from '../services/ipfs';
import { logger } from '../utils/logger';
import { useAttestEvent } from '../hooks/useAttestEvent';
import { useAccount } from 'wagmi';
import { getExplorerTxUrl } from '../services/chain';
import { useEvents } from '../hooks/useEvents';
import { useCanSign, useAuthorizationStatus } from './AccessControl';
import { usePermissions } from '../hooks/usePermissions';

interface AddEventModalProps {
  assetId: string;
  onClose: () => void;
  onEventAdded: (event: Event) => void;
}

const EVENT_TYPES: EventType[] = [
  'manufacturing',
  'quality_control',
  'compliance_check',
  'traceability_update',
  'process_validation',
  'safety_inspection',
  'environmental_audit',
  'certification',
  'carbon_footprint_measurement',
  'water_usage_tracking',
  'waste_management',
  'renewable_energy_certification',
  'circular_economy_tracking',
  'social_impact_measurement',
  'biodiversity_assessment',
  'supply_chain_sustainability',
  'other'
];

export function AddEventModal({ assetId, onClose, onEventAdded }: AddEventModalProps) {
  const { isConnected } = useAccount();
  const canSignAllowlist = useCanSign(); // Fase 1: allowlist
  const { canSign: canSignPermission } = usePermissions(); // Fase 2: permisos
  const authStatus = useAuthorizationStatus();
  const { attestEvent, isLoading: isAttesting, isPending: isAttestPending, isSuccess: isAttestSuccess, isError: isAttestError, error: attestError, txHash } = useAttestEvent();
  const { addEvent, updateEventStatusAndTxHash } = useEvents();
  
  // Puede firmar si tiene permiso (Fase 2) O está en allowlist (Fase 1)
  const canSign = canSignPermission || canSignAllowlist;
  
  const [eventType, setEventType] = useState<EventType>('manufacturing');
  const [standardTag, setStandardTag] = useState('');
  const [operator, setOperator] = useState('');
  const [ttlDays, setTtlDays] = useState(365);
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [fileSha256, setFileSha256] = useState<string | null>(null);
  const [isCalculatingHash, setIsCalculatingHash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [manifestCid, setManifestCid] = useState<string | null>(null);
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);
  const [showAttestButton, setShowAttestButton] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
      setUploadProgress('Preparando datos del evento...');

    try {
      const eventTimestamp = new Date(timestamp).toISOString();

      // Step 1: (Optional) Upload file to IPFS first if provided
      let fileCid: string | undefined;
      if (evidenceFile && fileSha256) {
        setUploadProgress('Subiendo archivo de evidencia a IPFS...');
        try {
          fileCid = await uploadFile(evidenceFile);
          logger.debug('File uploaded to IPFS', { cid: fileCid, fileName: evidenceFile.name }, 'EVENT');
        } catch (error) {
          logger.warn('Failed to upload file, continuing without file CID', {
            error: error instanceof Error ? error.message : 'Unknown',
            fileName: evidenceFile.name
          }, 'EVENT');
          // Continue without file CID - manifest will still be uploaded
        }
      }

      // Step 2: Build manifest JSON (include fileCid if file was uploaded)
      setUploadProgress('Construyendo manifiesto...');
      const manifest = {
        assetId,
        eventType,
        standardTag: standardTag || undefined,
        operator: operator || 'Unknown Operator',
        timestamp: eventTimestamp,
        fileSha256: fileSha256 || undefined,
        ttlDays,
        // Include file CID if file was uploaded to IPFS
        ...(fileCid && {
          fileCid
        }),
        // Include file metadata if file exists
        ...(evidenceFile && {
          fileName: evidenceFile.name,
          fileSize: evidenceFile.size,
          mimeType: evidenceFile.type
        })
      };

      logger.debug('Manifest created', { manifest }, 'EVENT');

      // Step 3: Upload manifest to IPFS
      setUploadProgress('Subiendo manifiesto a IPFS...');
      let manifestCid: string;
      try {
        manifestCid = await uploadJson(manifest);
        logger.debug('Manifest uploaded to IPFS', { cid: manifestCid }, 'EVENT');
      } catch (error) {
        logger.error('Failed to upload manifest', {
          error: error instanceof Error ? error.message : 'Unknown'
        }, 'EVENT');
        throw new Error(`Failed to upload manifest: ${error instanceof Error ? error.message : 'Unknown'}`);
      }

      // Step 4: Create Event object (pending status - will be updated to valid after attestation)
      setUploadProgress('Creando registro del evento...');
      const newEvent: Event = {
        id: `EVT-${Date.now()}`,
        assetId,
        eventType,
        standardTag: standardTag || undefined,
        operator: operator || 'Unknown Operator',
        timestamp: eventTimestamp,
        ttlDays,
        evidenceCid: manifestCid, // Use manifest CID as evidence
        fileSha256: fileSha256 || undefined,
        status: 'pending' as Status
      };

      logger.debug('Event created', {
        eventId: newEvent.id,
        manifestCid,
        fileCid,
        hasFile: !!evidenceFile
      }, 'EVENT');

      // Save event to IndexedDB
      await addEvent(newEvent);
      
      setManifestCid(manifestCid);
      setCreatedEvent(newEvent);
      setIsSubmitting(false);
      setShowAttestButton(true);
      setUploadProgress('¡Evento creado! Ahora puedes attestarlo on-chain.');
    } catch (error) {
      logger.error('Failed to add event', {
        error: error instanceof Error ? error.message : 'Unknown',
        assetId
      }, 'EVENT');
      
      setIsSubmitting(false);
      setUploadProgress('');
      alert(`Failed to add event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Calculate SHA-256 hash when file is selected
   */
  useEffect(() => {
    const calculateHash = async () => {
      if (!evidenceFile) {
        setFileSha256(null);
        return;
      }

      setIsCalculatingHash(true);
      try {
        logger.debug('Calculating SHA-256 hash for file', {
          fileName: evidenceFile.name,
          fileSize: evidenceFile.size
        }, 'EVENT');

        const hash = await computeFileHash(evidenceFile);
        setFileSha256(hash);
        
        logger.debug('SHA-256 hash calculated', {
          fileName: evidenceFile.name,
          hash: hash.substring(0, 20) + '...'
        }, 'EVENT');
      } catch (error) {
        logger.error('Failed to calculate file hash', {
          fileName: evidenceFile.name,
          error: error instanceof Error ? error.message : 'Unknown'
        }, 'EVENT');
        setFileSha256(null);
      } finally {
        setIsCalculatingHash(false);
      }
    };

    calculateHash();
  }, [evidenceFile]);

  // Handle attestation success
  useEffect(() => {
    if (isAttestSuccess && createdEvent && txHash) {
      logger.debug('Attestation successful', {
        eventId: createdEvent.id,
        txHash
      }, 'EVENT');

      // Update event in IndexedDB with txHash and valid status
      updateEventStatusAndTxHash(createdEvent.id, 'valid', txHash).then(() => {
        // Update event with txHash and valid status
        const attestedEvent: Event = {
          ...createdEvent,
          txHash,
          status: 'valid' as Status
        };

        setUploadProgress('Event attested on-chain successfully!');
        
        // Wait a moment to show success, then close and add event
        setTimeout(() => {
          onEventAdded(attestedEvent);
          onClose();
        }, 1500);
      }).catch((error) => {
        logger.error('Failed to update event status in DB', { error, eventId: createdEvent.id }, 'EVENT');
        // Still show success and close, but log the error
        const attestedEvent: Event = {
          ...createdEvent,
          txHash,
          status: 'valid' as Status
        };
        setUploadProgress('Event attested on-chain successfully!');
        setTimeout(() => {
          onEventAdded(attestedEvent);
          onClose();
        }, 1500);
      });
    }
  }, [isAttestSuccess, createdEvent, txHash, onEventAdded, onClose, updateEventStatusAndTxHash]);

  // Handle attestation error
  useEffect(() => {
    if (isAttestError && attestError) {
      logger.error('Attestation failed', {
        error: attestError.message,
        eventId: createdEvent?.id
      }, 'EVENT');
      setUploadProgress(`Attestation fallida: ${attestError.message}`);
    }
  }, [isAttestError, attestError, createdEvent]);

  const handleAttest = async () => {
    if (!createdEvent || !manifestCid || !fileSha256) {
      alert('Faltan datos requeridos para attestation');
      return;
    }

    try {
      setUploadProgress('Preparando attestation...');
      await attestEvent({
        assetId: createdEvent.assetId,
        eventId: createdEvent.id,
        cidManifest: manifestCid,
        fileSha256: fileSha256.startsWith('0x') ? fileSha256 : `0x${fileSha256}`,
        ttlDays: createdEvent.ttlDays
      });
      setUploadProgress('¡Transacción enviada! Esperando confirmación...');
    } catch (error) {
      logger.error('Failed to attest event', {
        error: error instanceof Error ? error.message : 'Unknown',
        eventId: createdEvent.id
      }, 'EVENT');
      setUploadProgress(`Error al attestar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleSkipAttestation = () => {
    // Event already saved to IndexedDB, just close modal
    if (createdEvent) {
      onEventAdded(createdEvent);
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El tamaño del archivo excede el límite de 10MB');
        return;
      }
      setEvidenceFile(file);
      setFileSha256(null); // Reset hash, will be calculated in useEffect
    } else {
      setEvidenceFile(null);
      setFileSha256(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agregar Nuevo Evento</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event Type *
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {EVENT_TYPE_NAMES[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Standard Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Etiqueta de Estándar (Opcional)
            </label>
            <input
              type="text"
              value={standardTag}
              onChange={(e) => setStandardTag(e.target.value)}
              placeholder="e.g., ISO 9001:2015, NOM-001"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Operator */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Operador *
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              placeholder="e.g., Factory A - Production Team"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Timestamp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Fecha y Hora del Evento *
            </label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* TTL Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              TTL (Tiempo de Vida) en Días *
            </label>
            <input
              type="number"
              value={ttlDays}
              onChange={(e) => setTtlDays(parseInt(e.target.value) || 365)}
              min="1"
              max="3650"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Número de días hasta que este evento expire (1-3650 días)
            </p>
          </div>

          {/* Evidence File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Archivo de Evidencia (Opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-6">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                id="evidence-file"
              />
              <label
                htmlFor="evidence-file"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {evidenceFile ? evidenceFile.name : 'Haz clic para subir archivo de evidencia'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </span>
              </label>
            </div>
            {evidenceFile && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400">
                  <FileText className="w-4 h-4" />
                  <span>{evidenceFile.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({(evidenceFile.size / 1024).toFixed(2)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceFile(null);
                      setFileSha256(null);
                    }}
                    className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
                
                {/* Hash calculation status */}
                {isCalculatingHash && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Calculando hash SHA-256...</span>
                  </div>
                )}
                
                {fileSha256 && !isCalculatingHash && (
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-gray-600 dark:text-gray-400">Hash calculado:</span>
                    <code className="text-xs font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2 py-1 rounded">
                      {fileSha256.substring(0, 16)}...
                    </code>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(fileSha256 || '')}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      title="Copiar hash"
                    >
                      <Hash className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className={`rounded-xl p-4 border ${
              uploadProgress.includes('successfully') || uploadProgress.includes('success')
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                : uploadProgress.includes('failed') || uploadProgress.includes('Failed')
                ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
                : 'bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20'
            }`}>
              <div className="flex items-center gap-3">
                {uploadProgress.includes('successfully') || uploadProgress.includes('success') ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : uploadProgress.includes('failed') || uploadProgress.includes('Failed') ? (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                ) : (
                  <Loader2 className="w-5 h-5 text-teal-600 dark:text-teal-400 animate-spin" />
                )}
                <span className={`text-sm ${
                  uploadProgress.includes('successfully') || uploadProgress.includes('success')
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : uploadProgress.includes('failed') || uploadProgress.includes('Failed')
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-teal-700 dark:text-teal-400'
                }`}>{uploadProgress}</span>
              </div>
              {txHash && (
                <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-500/20">
                  <a
                    href={getExplorerTxUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ver transacción en explorador
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Attestation Section */}
          {showAttestButton && createdEvent && (
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-500/5 dark:to-emerald-500/5 border border-teal-200 dark:border-teal-500/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Attestar Evento en Blockchain
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Registra este evento on-chain para verificación permanente y seguimiento de cumplimiento.
                  </p>
                  
                  {!isConnected && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-amber-700 dark:text-amber-400">
                          <p className="font-medium mb-1">Billetera no conectada</p>
                          <p>Conecta tu billetera para attestar este evento on-chain. Puedes guardarlo como pendiente y attestarlo más tarde.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleAttest}
                      disabled={!isConnected || isAttesting || isAttestPending || !manifestCid || !fileSha256}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAttesting || isAttestPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Attestando...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          Attestar on-chain
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipAttestation}
                      disabled={isAttesting || isAttestPending}
                      className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Guardar como Pendiente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {!showAttestButton && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isCalculatingHash || (evidenceFile && !fileSha256)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Agregar Evento
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

