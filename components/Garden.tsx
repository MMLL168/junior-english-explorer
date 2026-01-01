import React, { useState } from 'react';
import { Plant, RewardCard, UserResources } from '../types';
import { Droplets, Star, Sprout, Gift, ArrowUpCircle, Utensils, Gamepad2, Tv, Sparkles } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

interface GardenProps {
    resources: UserResources;
    plants: Plant[];
    onUpdatePlants: (plants: Plant[]) => void;
    onUpdateResources: (resources: UserResources) => void;
}

export const Garden: React.FC<GardenProps> = ({ resources, plants, onUpdatePlants, onUpdateResources }) => {
    const [activeTab, setActiveTab] = useState<'GARDEN' | 'SHOP'>('GARDEN');
    const [redeemedReward, setRedeemedReward] = useState<RewardCard | null>(null);

    // Reward Shop Items
    const shopItems: RewardCard[] = [
        { id: '1', title: '20 Mins Screen Time (看電視/玩手機 20 分鐘)', cost: 20, icon: '📺', color: 'bg-blue-500' },
        { id: '2', title: 'Favorite Snack (喜歡的零食)', cost: 8, icon: '🍪', color: 'bg-orange-500' },
        { id: '3', title: 'Fast Food Trip (吃速食/麥當勞)', cost: 20, icon: '🍔', color: 'bg-red-500' },
        { id: '4', title: 'Skip Chores (免做家事一次)', cost: 15, icon: '🧹', color: 'bg-purple-500' },
        { id: '5', title: 'Pocket Money Bonus (增加零用錢)', cost: 50, icon: '💰', color: 'bg-green-500' },
    ];

    const handleWater = (plantIndex: number) => {
        const plant = plants[plantIndex];
        
        // Validation
        if (plant.stage === 4) return; // Already mature
        if (resources.waterDrops <= 0) {
            alert("Not enough Water Drops! Go learn some English to earn more. \n水滴不夠了！快去練習英文賺取水滴吧！");
            return;
        }

        // Logic
        const newPlants = [...plants];
        const newResources = { ...resources };

        newResources.waterDrops -= 1;
        newPlants[plantIndex].waterLevel += 1;

        // Check if level up
        if (newPlants[plantIndex].waterLevel >= newPlants[plantIndex].waterNeeded) {
            newPlants[plantIndex].stage += 1;
            newPlants[plantIndex].waterLevel = 0;
            newPlants[plantIndex].waterNeeded += 2; // Harder next level
            
            // Celebration for growth
             canvasConfetti({
                particleCount: 50,
                spread: 60,
                origin: { x: 0.5, y: 0.7 }, // Approx where pots are
                colors: ['#00F260', '#FFD200']
            });
        }

        onUpdatePlants(newPlants);
        onUpdateResources(newResources);
    };

    const handleHarvest = (plantIndex: number) => {
        const newPlants = [...plants];
        const newResources = { ...resources };

        // Reset plant
        newPlants[plantIndex] = {
            ...newPlants[plantIndex],
            stage: 1, // Back to seed
            waterLevel: 0,
            waterNeeded: 2
        };

        // Give reward
        newResources.stars += 1;

        onUpdatePlants(newPlants);
        onUpdateResources(newResources);

        canvasConfetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#FFD200', '#FFA500']
        });
    };

    const handleRedeem = (item: RewardCard) => {
        if (resources.stars < item.cost) {
            alert("Not enough Stars! Grow more plants to earn stars. \n星星不夠喔！多種植植物來獲得星星。");
            return;
        }

        if (confirm(`Spend ${item.cost} Stars for "${item.title}"? \n確定要花費 ${item.cost} 顆星星兌換 "${item.title}" 嗎？`)) {
            const newResources = { ...resources };
            newResources.stars -= item.cost;
            onUpdateResources(newResources);
            setRedeemedReward(item);
            
            canvasConfetti({
                particleCount: 200,
                spread: 120,
                colors: ['#FFD200', '#4FACFE', '#FF9A8B']
            });
        }
    };

    const renderPlant = (plant: Plant, index: number) => {
        // Visuals based on stage
        let emoji = '🪴';
        let scale = 'scale-100';
        let label = 'Empty';

        if (plant.stage === 1) { emoji = '🌱'; label = 'Seed'; scale='scale-75'; }
        if (plant.stage === 2) { emoji = '🌿'; label = 'Sprout'; scale='scale-90'; }
        if (plant.stage === 3) { emoji = '🌷'; label = 'Flower'; scale='scale-110'; }
        if (plant.stage === 4) { emoji = '🍎'; label = 'Fruit'; scale='scale-125'; }

        const progress = (plant.waterLevel / plant.waterNeeded) * 100;

        return (
            <div key={index} className="bg-slate-800 rounded-3xl p-4 flex flex-col items-center border-2 border-slate-700 shadow-xl relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-900/20 to-transparent"></div>

                <div className={`w-32 h-32 flex items-center justify-center text-7xl mb-4 transition-all duration-500 drop-shadow-2xl filter ${scale} ${plant.stage === 4 ? 'animate-bounce' : ''}`}>
                    {emoji}
                </div>

                <div className="w-full space-y-3 z-10">
                    {plant.stage < 4 ? (
                        <>
                             <div className="flex justify-between text-xs font-bold text-slate-400 px-1">
                                <span>{label}</span>
                                <span>{plant.waterLevel}/{plant.waterNeeded} 💧</span>
                             </div>
                             <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden border border-slate-600">
                                <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                             </div>
                             <button 
                                onClick={() => handleWater(index)}
                                className="w-full bg-blue-500 hover:bg-blue-400 active:scale-95 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30"
                             >
                                <Droplets size={18} fill="currentColor" /> Water
                             </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => handleHarvest(index)}
                            className="w-full bg-brand-yellow hover:bg-yellow-300 text-yellow-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/50 animate-pulse"
                        >
                            <Star size={20} fill="currentColor" /> Harvest!
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in pb-20">
            {/* Header Stats */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-6 rounded-3xl shadow-xl border border-emerald-700/50 mb-6 flex justify-between items-center relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
                    <Sprout size={150} />
                </div>
                
                <div className="z-10 flex gap-6 w-full justify-around">
                     <div className="flex flex-col items-center">
                        <span className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Water Drops</span>
                        <div className="flex items-center gap-2">
                             <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 text-white">
                                <Droplets size={20} fill="currentColor" />
                             </div>
                             <span className="text-3xl font-display font-bold text-white">{resources.waterDrops}</span>
                        </div>
                     </div>
                     <div className="w-px bg-slate-600/50"></div>
                     <div className="flex flex-col items-center">
                        <span className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Stars</span>
                        <div className="flex items-center gap-2">
                             <div className="w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50 text-yellow-900">
                                <Star size={20} fill="currentColor" />
                             </div>
                             <span className="text-3xl font-display font-bold text-brand-yellow">{resources.stars}</span>
                        </div>
                     </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-800 p-1 rounded-2xl mb-6 mx-auto max-w-sm border border-slate-700">
                <button 
                    onClick={() => setActiveTab('GARDEN')}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'GARDEN' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    <Sprout size={16} /> My Garden
                </button>
                <button 
                    onClick={() => setActiveTab('SHOP')}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'SHOP' ? 'bg-brand-purple text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    <Gift size={16} /> Reward Shop
                </button>
            </div>

            {/* Garden View */}
            {activeTab === 'GARDEN' && (
                <div className="space-y-4">
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-white font-display">Magic Garden 魔法花園</h2>
                        <p className="text-slate-400 text-sm">Water your plants to get stars! <br/>用學習獲得的水滴來澆花，收成星星！</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {plants.map((plant, index) => renderPlant(plant, index))}
                    </div>
                </div>
            )}

            {/* Shop View */}
            {activeTab === 'SHOP' && (
                <div className="space-y-4">
                    <div className="text-center mb-4">
                         <h2 className="text-2xl font-bold text-white font-display">Gift Shop 獎勵商店</h2>
                         <p className="text-slate-400 text-sm">Spend stars to get rewards from parents! <br/>用星星兌換爸媽的獎勵卡！</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {shopItems.map((item) => (
                            <button 
                                key={item.id}
                                onClick={() => handleRedeem(item)}
                                className="bg-slate-800 p-4 rounded-2xl border-2 border-slate-700 flex items-center justify-between hover:border-brand-purple hover:bg-slate-750 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                                        {item.icon}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-lg">{item.title}</div>
                                        <div className="text-xs text-brand-yellow font-bold flex items-center gap-1">
                                            <Star size={12} fill="currentColor" /> Cost: {item.cost} Stars
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-900 rounded-full p-2 text-slate-500 group-hover:text-brand-purple group-hover:bg-brand-purple/20 transition-colors">
                                    <ArrowUpCircle size={24} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Reward Redemption Modal */}
            {redeemedReward && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl shadow-brand-yellow/50 border-4 border-brand-yellow">
                        <div className="absolute top-0 left-0 w-full h-4 bg-brand-yellow"></div>
                        <div className="w-24 h-24 mx-auto bg-brand-yellow/20 rounded-full flex items-center justify-center text-6xl mb-4 animate-bounce">
                            {redeemedReward.icon}
                        </div>
                        <h2 className="text-slate-900 font-display font-bold text-2xl mb-1">Reward Unlocked!</h2>
                        <h3 className="text-slate-500 font-bold mb-4">兌換成功！</h3>
                        
                        <div className="bg-slate-100 p-4 rounded-xl border-2 border-dashed border-slate-300 mb-6">
                            <p className="text-lg font-bold text-slate-800">{redeemedReward.title}</p>
                            <p className="text-xs text-slate-500 mt-2">Show this screen to your parents (請出示給爸媽看)</p>
                        </div>

                        <button 
                            onClick={() => setRedeemedReward(null)}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                            Close (關閉)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
