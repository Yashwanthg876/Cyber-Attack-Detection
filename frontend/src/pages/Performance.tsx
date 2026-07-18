import React from 'react';
import { 
  Cpu, 
  Zap, 
  CheckCircle2, 
  BarChart2, 
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';

export const Performance: React.FC = () => {
  // Epoch loss curves data for LSTM neural network
  const lstmTrainingCurves = [
    { epoch: 1, loss: 1.25, val_loss: 0.53, accuracy: 79.2, val_accuracy: 86.3 },
    { epoch: 2, loss: 0.38, val_loss: 0.26, accuracy: 89.5, val_accuracy: 92.6 },
    { epoch: 3, loss: 0.19, val_loss: 0.13, accuracy: 94.7, val_accuracy: 96.8 },
    { epoch: 4, loss: 0.11, val_loss: 0.08, accuracy: 97.4, val_accuracy: 98.0 },
    { epoch: 5, loss: 0.08, val_loss: 0.06, accuracy: 98.0, val_accuracy: 98.5 },
    { epoch: 6, loss: 0.07, val_loss: 0.05, accuracy: 98.4, val_accuracy: 98.8 },
    { epoch: 7, loss: 0.06, val_loss: 0.05, accuracy: 98.5, val_accuracy: 98.9 },
    { epoch: 8, loss: 0.05, val_loss: 0.04, accuracy: 98.6, val_accuracy: 98.8 }
  ];

  const models = [
    {
      name: 'Random Forest',
      icon: Cpu,
      color: 'text-brand-glow bg-brand-glow/10 border-brand-glow/30',
      metrics: {
        accuracy: '99.00%',
        loss: 'N/A',
        precision: '98.91%',
        recall: '99.00%',
        train_time: '0.30s',
        infer_latency: '1.24ms'
      }
    },
    {
      name: 'XGBoost',
      icon: Zap,
      color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/30',
      metrics: {
        accuracy: '99.25%',
        loss: '0.053',
        precision: '99.21%',
        recall: '99.25%',
        train_time: '2.21s',
        infer_latency: '0.78ms'
      }
    },
    {
      name: 'LSTM (Deep Learning)',
      icon: Activity,
      color: 'text-brand-purple bg-brand-purple/10 border-brand-purple/30',
      metrics: {
        accuracy: '98.87%',
        loss: '0.046',
        precision: '98.87%',
        recall: '98.87%',
        train_time: '5.00s',
        infer_latency: '5.41ms'
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards comparison grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((model) => (
          <div key={model.name} className="cyber-glass rounded-xl border border-cyber-border p-6 flex flex-col justify-between h-72 glow-blue-hover transition-all">
            <div className="flex items-center space-x-3 border-b border-cyber-border/40 pb-3 mb-4">
              <div className={`p-2 rounded-lg border ${model.color}`}>
                <model.icon size={20} />
              </div>
              <h4 className="text-sm font-bold font-mono text-white uppercase tracking-wider">{model.name}</h4>
            </div>

            <div className="space-y-3 font-mono text-xs text-white">
              <div className="flex justify-between border-b border-cyber-border/20 py-1">
                <span className="text-cyber-muted uppercase">Accuracy:</span>
                <span className="font-bold text-brand-success">{model.metrics.accuracy}</span>
              </div>
              <div className="flex justify-between border-b border-cyber-border/20 py-1">
                <span className="text-cyber-muted uppercase">Precision:</span>
                <span className="font-bold text-white">{model.metrics.precision}</span>
              </div>
              <div className="flex justify-between border-b border-cyber-border/20 py-1">
                <span className="text-cyber-muted uppercase">Recall:</span>
                <span className="font-bold text-white">{model.metrics.recall}</span>
              </div>
              <div className="flex justify-between border-b border-cyber-border/20 py-1">
                <span className="text-cyber-muted uppercase">Loss:</span>
                <span className="font-bold text-brand-warning">{model.metrics.loss}</span>
              </div>
              <div className="flex justify-between border-b border-cyber-border/20 py-1">
                <span className="text-cyber-muted uppercase">Training Duration:</span>
                <span className="font-bold text-brand-glow">{model.metrics.train_time}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-cyber-muted uppercase">Inference Speed:</span>
                <span className="font-bold text-brand-purple">{model.metrics.infer_latency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Epoch training curves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts chart */}
        <div className="lg:col-span-2 cyber-glass rounded-xl border border-cyber-border p-6 flex flex-col justify-between">
          <div className="border-b border-cyber-border/40 pb-4 mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center">
              <BarChart2 className="w-4 h-4 text-brand-purple mr-2" /> LSTM Neural Loss Decay
            </h3>
            <p className="text-[10px] text-cyber-muted font-mono mt-0.5">Training vs Validation loss decay curve over 8 epochs</p>
          </div>

          <div className="h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lstmTrainingCurves} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="epoch" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#0F1626', borderColor: '#1E293B', borderRadius: 8 }} />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
                <Line type="monotone" dataKey="loss" name="Training Loss" stroke="#EF4444" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="val_loss" name="Validation Loss" stroke="#00F0FF" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LSTM Accuracy curve */}
        <div className="cyber-glass rounded-xl border border-cyber-border p-6 flex flex-col justify-between">
          <div className="border-b border-cyber-border/40 pb-4 mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center">
              <CheckCircle2 className="w-4 h-4 text-brand-success mr-2" /> LSTM Accuracy Learning
            </h3>
            <p className="text-[10px] text-cyber-muted font-mono mt-0.5">Accuracy progress metrics over epochs</p>
          </div>

          <div className="h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lstmTrainingCurves} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="epoch" stroke="#94A3B8" />
                <YAxis domain={[75, 100]} stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#0F1626', borderColor: '#1E293B', borderRadius: 8 }} />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
                <Line type="monotone" dataKey="accuracy" name="Train Accuracy %" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="val_accuracy" name="Val Accuracy %" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
