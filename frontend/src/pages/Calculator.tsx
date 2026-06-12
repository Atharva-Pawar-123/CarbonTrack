import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Zap, Utensils, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../services/api';

const STEPS = [
  { id: 'transport', title: 'Transport', icon: <Car className="w-5 h-5" /> },
  { id: 'energy', title: 'Energy', icon: <Zap className="w-5 h-5" /> },
  { id: 'diet', title: 'Diet', icon: <Utensils className="w-5 h-5" /> },
  { id: 'consumption', title: 'Consumption', icon: <ShoppingBag className="w-5 h-5" /> }
];

export default function Calculator() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [month] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [transport, setTransport] = useState({
    car_km: 0, fuel_type: 'petrol', flight_km_short: 0, flight_km_long: 0, bus_km: 0, metro_km: 0, motorbike_km: 0
  });

  const [energy, setEnergy] = useState({
    electricity_kwh: 0, gas_m3: 0, lpg_cylinders: 0, region_grid_factor: 0.82
  });

  const [diet, setDiet] = useState({
    diet_type: 'omnivore'
  });

  const [consumption, setConsumption] = useState({
    clothing_items: 0, electronics_bought: 0, waste_recycling: 'partial'
  });

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    const payload = {
      month,
      transport,
      energy,
      diet,
      consumption
    };

    try {
      await api.post('/footprint/', payload);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(JSON.stringify(err.response.data.detail));
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Carbon Calculator</h1>
        <p className="text-neutral-600">Enter your monthly data for {month} to get personalized insights.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isActive ? 'border-primary bg-primary/10 text-primary' : 
                isCompleted ? 'border-primary bg-primary text-white' : 
                'border-neutral-300 text-neutral-400 bg-white'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
              </div>
              <div className="hidden sm:block ml-3">
                <p className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-neutral-900' : 'text-neutral-500'}`}>
                  {step.title}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-12 sm:w-24 h-1 mx-2 sm:mx-4 rounded ${isCompleted ? 'bg-primary' : 'bg-neutral-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8 mb-6 min-h-[400px]">
        {currentStep === 0 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Transport Emissions</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Car Travel (km)</label>
                <input type="number" min="0" value={transport.car_km} onChange={e => setTransport({...transport, car_km: Number(e.target.value)})} className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Car Fuel Type</label>
                <select value={transport.fuel_type} onChange={e => setTransport({...transport, fuel_type: e.target.value})} className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50">
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Motorbike Travel (km)</label>
                <input type="number" min="0" value={transport.motorbike_km} onChange={e => setTransport({...transport, motorbike_km: Number(e.target.value)})} className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Bus Travel (km)</label>
                <input type="number" min="0" value={transport.bus_km} onChange={e => setTransport({...transport, bus_km: Number(e.target.value)})} className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Metro/Train Travel (km)</label>
                <input type="number" min="0" value={transport.metro_km} onChange={e => setTransport({...transport, metro_km: Number(e.target.value)})} className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Short Flights (km)</label>
                <input type="number" min="0" value={transport.flight_km_short} onChange={e => setTransport({...transport, flight_km_short: Number(e.target.value)})} className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Long Flights (km)</label>
                <input type="number" min="0" value={transport.flight_km_long} onChange={e => setTransport({...transport, flight_km_long: Number(e.target.value)})} className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Home Energy Usage</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Electricity (kWh)</label>
                <input type="number" min="0" value={energy.electricity_kwh} onChange={e => setEnergy({...energy, electricity_kwh: Number(e.target.value)})} className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Piped Gas (m³)</label>
                <input type="number" min="0" value={energy.gas_m3} onChange={e => setEnergy({...energy, gas_m3: Number(e.target.value)})} className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">LPG Cylinders used</label>
                <input type="number" min="0" step="0.5" value={energy.lpg_cylinders} onChange={e => setEnergy({...energy, lpg_cylinders: Number(e.target.value)})} className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Regional Grid Factor</label>
                <select value={energy.region_grid_factor} onChange={e => setEnergy({...energy, region_grid_factor: Number(e.target.value)})} className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50">
                  <option value={0.82}>National Average (0.82)</option>
                  <option value={0.95}>Coal Heavy Region (0.95)</option>
                  <option value={0.65}>Renewable Heavy Region (0.65)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Dietary Habits</h2>
            
            <div className="max-w-md">
              <label className="block text-sm font-medium text-neutral-700 mb-3">Which best describes your diet?</label>
              <div className="space-y-3">
                {[
                  { id: 'meat_heavy', label: 'Meat Heavy', desc: 'Meat with almost every meal' },
                  { id: 'omnivore', label: 'Omnivore', desc: 'Mixed diet, average meat consumption' },
                  { id: 'no_beef', label: 'No Beef/Mutton', desc: 'Only chicken or fish' },
                  { id: 'vegetarian', label: 'Vegetarian', desc: 'No meat, but consume dairy/eggs' },
                  { id: 'vegan', label: 'Vegan', desc: 'Completely plant-based' }
                ].map(option => (
                  <label key={option.id} className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${diet.diet_type === option.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                    <div className="flex items-center h-5">
                      <input type="radio" name="diet_type" value={option.id} checked={diet.diet_type === option.id} onChange={e => setDiet({ diet_type: e.target.value })} className="focus:ring-primary h-4 w-4 text-primary border-neutral-300" />
                    </div>
                    <div className="ml-3 flex flex-col">
                      <span className="block text-sm font-medium text-neutral-900">{option.label}</span>
                      <span className="block text-sm text-neutral-500">{option.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Consumption & Waste</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">New Clothing Items Bought</label>
                <input type="number" min="0" value={consumption.clothing_items} onChange={e => setConsumption({...consumption, clothing_items: Number(e.target.value)})} className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Electronics Bought</label>
                <input type="number" min="0" value={consumption.electronics_bought} onChange={e => setConsumption({...consumption, electronics_bought: Number(e.target.value)})} className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Waste Recycling Habit</label>
                <select value={consumption.waste_recycling} onChange={e => setConsumption({...consumption, waste_recycling: e.target.value})} className="block w-full sm:w-1/2 border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50">
                  <option value="none">No recycling (Everything to landfill)</option>
                  <option value="partial">Partial recycling (Dry waste / Plastics)</option>
                  <option value="full">Full recycling & Composting</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0 || loading}
          className="flex items-center px-4 py-2 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-600 transition-colors"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-600 focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
            Calculate Footprint
          </button>
        )}
      </div>
    </div>
  );
}
