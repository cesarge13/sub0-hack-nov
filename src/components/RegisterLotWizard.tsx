import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Upload, File, X, Loader, CheckCircle } from 'lucide-react';
import { origenApi } from '../services/origenApi';

interface RegisterLotWizardProps {
  onNavigate: (screen: string) => void;
}

export function RegisterLotWizard({ onNavigate }: RegisterLotWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lotId, setLotId] = useState<string | null>(null);

  // Step 1: Crop Data
  const [cropType, setCropType] = useState('');
  const [area, setArea] = useState('');
  const [weight, setWeight] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [harvestDate, setHarvestDate] = useState('');

  // Step 2: Location
  const [location, setLocation] = useState('');
  const [cooperative, setCooperative] = useState('');

  // Step 3: Evidence
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const steps = [
    { number: 1, title: 'Crop Data' },
    { number: 2, title: 'Location' },
    { number: 3, title: 'Evidence' },
    { number: 4, title: 'Summary' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const lot = await origenApi.registerLot({
        cropType,
        area: parseFloat(area),
        weight: weight ? parseFloat(weight) : undefined,
        location,
        cooperative,
        plantingDate,
        harvestDate
      });
      
      // Upload evidence files
      for (const file of uploadedFiles) {
        await origenApi.uploadEvidence(lot.id, file);
      }
      
      setLotId(lot.id);
      setStep(5); // Success step
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = cropType && area && plantingDate && harvestDate;
  const canProceedStep2 = location && cooperative;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step > s.number
                    ? 'bg-green-600 text-white'
                    : step === s.number
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                </div>
                <span className={`text-sm mt-2 ${
                  step >= s.number 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {s.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-px flex-1 mx-4 ${
                  step > s.number 
                    ? 'bg-green-600' 
                    : 'bg-gray-200 dark:bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl text-gray-900 dark:text-white">Crop Data</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Crop Type *
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select crop type</option>
                <option value="Corn">Corn</option>
                <option value="Beans">Beans</option>
                <option value="Wheat">Wheat</option>
                <option value="Tomatoes">Tomatoes</option>
                <option value="Rice">Rice</option>
                <option value="Soybeans">Soybeans</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Area (hectares) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="5.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="12000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Planting Date *
                </label>
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Harvest Date *
                </label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl text-gray-900 dark:text-white">Location & Cooperative</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Jalisco, Mexico"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cooperative *
              </label>
              <input
                type="text"
                value={cooperative}
                onChange={(e) => setCooperative(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Cooperativa Agrícola del Valle"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl text-gray-900 dark:text-white">Evidence Upload</h2>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg text-gray-900 dark:text-white mb-2">Upload Evidence to Filecoin Cloud</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Synapse SDK is used to store evidence on Filecoin Onchain Cloud
              </p>
              <label className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded Files ({uploadedFiles.length})</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-cyan-500" />
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl text-gray-900 dark:text-white">Summary</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Crop Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Crop Type</p>
                    <p className="text-sm text-gray-900 dark:text-white">{cropType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Area</p>
                    <p className="text-sm text-gray-900 dark:text-white">{area} hectares</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Planting Date</p>
                    <p className="text-sm text-gray-900 dark:text-white">{plantingDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Harvest Date</p>
                    <p className="text-sm text-gray-900 dark:text-white">{harvestDate}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Location</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-sm text-gray-900 dark:text-white">{location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cooperative</p>
                    <p className="text-sm text-gray-900 dark:text-white">{cooperative}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Evidence Files</h4>
                <p className="text-sm text-gray-900 dark:text-white">{uploadedFiles.length} files ready for upload</p>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl text-gray-900 dark:text-white mb-2">Lot Registered Successfully!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Transaction confirmed: Lot {lotId}
            </p>
            <button
              onClick={() => onNavigate('lots')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Go to Lots Management
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onNavigate('lots')}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Register Lot (Mint NFT)
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
