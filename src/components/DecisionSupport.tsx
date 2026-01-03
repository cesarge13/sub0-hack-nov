import React, { useMemo } from 'react';
import { Target, TrendingUp, AlertCircle, Lightbulb, Zap, Droplet, Leaf, DollarSign, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { generateRecommendations, type DecisionRecommendation } from '../services/decisionSupport';
import { useAssets } from '../hooks/useAssets';
import { useEvents } from '../hooks/useEvents';

export function DecisionSupport() {
  const { assets, isLoading: assetsLoading } = useAssets();
  const { events, isLoading: eventsLoading } = useEvents();

  const recommendations = useMemo(() => {
    if (assetsLoading || eventsLoading) return [];
    return generateRecommendations(assets, events);
  }, [assets, events, assetsLoading, eventsLoading]);

  const operationalDecisions = recommendations.filter(r => r.type === 'operational');
  const strategicDecisions = recommendations.filter(r => r.type === 'strategic');

  const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;
  const immediateCount = recommendations.filter(r => r.urgency === 'immediate').length;

  if (assetsLoading || eventsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          Cargando recomendaciones...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Apoyo a la Toma de Decisiones</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Recomendaciones inteligentes basadas en análisis de datos para optimizar procesos productivos sostenibles
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{operationalDecisions.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Decisiones Operativas</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{strategicDecisions.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Decisiones Estratégicas</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{highPriorityCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Alta Prioridad</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{recommendations.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Recomendaciones Totales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Inmediatas */}
      {immediateCount > 0 && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
              {immediateCount} acción{immediateCount > 1 ? 'es' : ''} requiere atención inmediata
            </h3>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">
            Hay recomendaciones que requieren acción inmediata para evitar interrupciones operativas o pérdidas de eficiencia.
          </p>
        </div>
      )}

      {/* Decisiones Operativas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Decisiones Operativas</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Acciones inmediatas basadas en datos operativos para optimizar procesos productivos</p>
          </div>
        </div>
        <div className="space-y-4">
          {operationalDecisions.length > 0 ? (
            operationalDecisions.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No hay decisiones operativas pendientes en este momento</p>
              <p className="text-sm mt-2">Todas las operaciones están optimizadas según los datos actuales</p>
            </div>
          )}
        </div>
      </div>

      {/* Decisiones Estratégicas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Decisiones Estratégicas</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Oportunidades de mejora a largo plazo basadas en análisis de tendencias y datos históricos</p>
          </div>
        </div>
        <div className="space-y-4">
          {strategicDecisions.length > 0 ? (
            strategicDecisions.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No hay decisiones estratégicas pendientes en este momento</p>
              <p className="text-sm mt-2">Las estrategias actuales están bien alineadas con los objetivos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: DecisionRecommendation }) {
  const CategoryIcon = getCategoryIcon(recommendation.category);
  const priorityColor = getPriorityColor(recommendation.priority);
  const urgencyColor = getUrgencyColor(recommendation.urgency);

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center flex-shrink-0">
            <CategoryIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{recommendation.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColor}`}>
                {recommendation.priority === 'high' ? 'Alta' : recommendation.priority === 'medium' ? 'Media' : 'Baja'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyColor}`}>
                {recommendation.urgency === 'immediate' ? 'Inmediata' : recommendation.urgency === 'soon' ? 'Pronto' : 'Planificación'}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{recommendation.description}</p>
            <div className="bg-teal-50 dark:bg-teal-500/5 border border-teal-200 dark:border-teal-500/10 rounded-lg p-3 mb-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Acción Sugerida:
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation.suggestedAction}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Impacto Esperado */}
      {recommendation.expectedImpact && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          {recommendation.expectedImpact.carbonReduction !== undefined && (
            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-500/5 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {recommendation.expectedImpact.carbonReduction} tCO₂e
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Reducción CO₂</div>
            </div>
          )}
          {recommendation.expectedImpact.resourceSavings?.water !== undefined && (
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-500/5 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Droplet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {recommendation.expectedImpact.resourceSavings.water}L
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Ahorro Agua</div>
            </div>
          )}
          {recommendation.expectedImpact.resourceSavings?.energy !== undefined && (
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-500/5 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {recommendation.expectedImpact.resourceSavings.energy} kWh
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Ahorro Energía</div>
            </div>
          )}
          {recommendation.expectedImpact.costSavings !== undefined && (
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-500/5 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  ${(recommendation.expectedImpact.costSavings / 1000000).toFixed(1)}M CLP
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Ahorro Estimado</div>
            </div>
          )}
          {recommendation.expectedImpact.efficiencyGain !== undefined && (
            <div className="text-center p-3 bg-teal-50 dark:bg-teal-500/5 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <div className="text-lg font-bold text-teal-600 dark:text-teal-400">
                  +{recommendation.expectedImpact.efficiencyGain}%
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Mejora Eficiencia</div>
            </div>
          )}
        </div>
      )}

      {/* Confianza y Datos Relacionados */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">Confianza:</span>
          <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full max-w-32">
            <div 
              className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${recommendation.confidence}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[3rem]">
            {recommendation.confidence}%
          </span>
        </div>
        {recommendation.relatedData.currentValue !== undefined && recommendation.relatedData.targetValue !== undefined && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Actual: {recommendation.relatedData.currentValue}</span>
            <ArrowRight className="w-3 h-3" />
            <span>Meta: {recommendation.relatedData.targetValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'efficiency': return Zap;
    case 'compliance': return CheckCircle;
    case 'sustainability': return Leaf;
    case 'cost': return DollarSign;
    default: return Lightbulb;
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20';
    case 'medium': return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
    case 'low': return 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
    default: return 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400';
  }
}

function getUrgencyColor(urgency: string) {
  switch (urgency) {
    case 'immediate': return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400';
    case 'soon': return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400';
    case 'planning': return 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400';
    default: return 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400';
  }
}

