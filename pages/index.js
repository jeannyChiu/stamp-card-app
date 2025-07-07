import React, { useState, useEffect } from 'react';
import { Gift, Star, RotateCcw, Award, Plus, Trash2, Save, Download, Upload } from 'lucide-react';

const StampCard = () => {
  const [cards, setCards] = useState([
    { id: 1, stamps: [false, false, false, false, false] }
  ]);
  const [totalRedeemed, setTotalRedeemed] = useState(0);
  const [showCongrats, setShowCongrats] = useState({ show: false, cardId: null });
  const [showReward, setShowReward] = useState(false);
  const [rewardType, setRewardType] = useState('');
  const [lastSaved, setLastSaved] = useState(null);

  // 從本地存儲載入資料
  useEffect(() => {
    const savedData = localStorage.getItem('stampCardData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setCards(parsedData.cards || [{ id: 1, stamps: [false, false, false, false, false] }]);
        setTotalRedeemed(parsedData.totalRedeemed || 0);
        setLastSaved(parsedData.lastSaved || null);
      } catch (error) {
        console.error('載入資料失敗:', error);
      }
    }
  }, []);

  // 自動儲存資料到本地存儲
  useEffect(() => {
    const dataToSave = {
      cards,
      totalRedeemed,
      lastSaved: new Date().toLocaleString('zh-TW')
    };
    localStorage.setItem('stampCardData', JSON.stringify(dataToSave));
    setLastSaved(new Date().toLocaleString('zh-TW'));
  }, [cards, totalRedeemed]);

  // 匯出資料
  const exportData = () => {
    const dataToExport = {
      cards,
      totalRedeemed,
      exportDate: new Date().toLocaleString('zh-TW')
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `集點卡資料_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 匯入資料
  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setCards(importedData.cards || [{ id: 1, stamps: [false, false, false, false, false] }]);
          setTotalRedeemed(importedData.totalRedeemed || 0);
          alert('資料匯入成功！');
        } catch (error) {
          alert('匯入失敗，請檢查檔案格式！');
        }
      };
      reader.readAsText(file);
    }
  };

  // 清除所有資料
  const clearAllData = () => {
    if (window.confirm('確定要清除所有資料嗎？此操作無法復原！')) {
      localStorage.removeItem('stampCardData');
      setCards([{ id: 1, stamps: [false, false, false, false, false] }]);
      setTotalRedeemed(0);
      setLastSaved(null);
      alert('所有資料已清除！');
    }
  };

  const stampSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const addCard = () => {
    const newCard = {
      id: Math.max(...cards.map(card => card.id)) + 1,
      stamps: [false, false, false, false, false]
    };
    setCards([...cards, newCard]);
  };

  const deleteCard = (cardId) => {
    if (cards.length > 1) {
      setCards(cards.filter(card => card.id !== cardId));
    }
  };

  const addStamp = (cardId, stampIndex) => {
    setCards(cards.map(card => {
      if (card.id === cardId) {
        if (card.stamps[stampIndex]) return card;
        
        stampSound();
        const newStamps = [...card.stamps];
        newStamps[stampIndex] = true;
        
        if (newStamps.every(stamp => stamp)) {
          setTimeout(() => {
            setShowCongrats({ show: true, cardId });
          }, 500);
        }
        
        return { ...card, stamps: newStamps };
      }
      return card;
    }));
  };

  const redeemReward = (cardId) => {
    const rewards = ['金色扭蛋', '銀色扭蛋', '彩虹扭蛋', '神秘扭蛋', '特別扭蛋'];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    
    setRewardType(randomReward);
    setShowReward(true);
    setTotalRedeemed(totalRedeemed + 1);
    
    setTimeout(() => {
      setCards(cards.map(card => {
        if (card.id === cardId) {
          return { ...card, stamps: [false, false, false, false, false] };
        }
        return card;
      }));
      setShowCongrats({ show: false, cardId: null });
      setShowReward(false);
    }, 3000);
  };

  const resetCard = (cardId) => {
    setCards(cards.map(card => {
      if (card.id === cardId) {
        return { ...card, stamps: [false, false, false, false, false] };
      }
      return card;
    }));
    setShowCongrats({ show: false, cardId: null });
    setShowReward(false);
  };

  const getCardStats = (card) => {
    const completedStamps = card.stamps.filter(stamp => stamp).length;
    const isComplete = completedStamps === 5;
    return { completedStamps, isComplete };
  };

  const totalStamps = cards.reduce((total, card) => {
    return total + card.stamps.filter(stamp => stamp).length;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎯 集點卡系統</h1>
          <p className="text-white/80">每張卡集滿5個章就可以換扭蛋！</p>
          {lastSaved && (
            <p className="text-white/60 text-sm mt-2">
              <Save className="w-4 h-4 inline mr-1" />
              最後儲存: {lastSaved}
            </p>
          )}
        </div>

        {/* 統計資訊 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 text-center text-white">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold">{cards.length}</div>
              <div className="text-sm opacity-80">集點卡數</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalStamps}</div>
              <div className="text-sm opacity-80">總集章數</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalRedeemed}</div>
              <div className="text-sm opacity-80">已換扭蛋</div>
            </div>
          </div>
        </div>

        {/* 資料管理工具 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={addCard}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增集點卡
            </button>
            
            <button
              onClick={exportData}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center text-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              匯出資料
            </button>
            
            <label className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center cursor-pointer text-sm">
              <Upload className="w-4 h-4 mr-1" />
              匯入資料
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
            
            <button
              onClick={clearAllData}
              className="bg-red-500/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-500/30 transition-all flex items-center text-sm"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              清除資料
            </button>
          </div>
        </div>

        {/* 集點卡網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const { completedStamps, isComplete } = getCardStats(card);
            
            return (
              <div key={card.id} className="bg-white rounded-3xl shadow-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-50"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">集點卡 #{card.id}</h3>
                    {cards.length > 1 && (
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {card.stamps.map((stamped, index) => (
                      <div
                        key={index}
                        onClick={() => addStamp(card.id, index)}
                        className={`
                          aspect-square rounded-full border-2 border-dashed cursor-pointer
                          transition-all duration-300 transform hover:scale-110
                          flex items-center justify-center text-lg font-bold
                          ${stamped 
                            ? 'bg-gradient-to-br from-green-400 to-blue-500 border-green-500 text-white shadow-lg' 
                            : 'border-gray-300 text-gray-400 hover:border-purple-400 hover:text-purple-400'
                          }
                        `}
                      >
                        {stamped ? (
                          <Star className="w-4 h-4 fill-current" />
                        ) : (
                          <div className="text-xs">
                            {index + 1}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>進度</span>
                      <span>{completedStamps}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(completedStamps / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => redeemReward(card.id)}
                      disabled={!isComplete}
                      className={`
                        flex-1 py-2 px-3 rounded-xl font-semibold text-sm transition-all duration-300
                        ${isComplete 
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      <Gift className="w-4 h-4 inline mr-1" />
                      {isComplete ? '兌換！' : `還差${5 - completedStamps}`}
                    </button>
                    
                    <button
                      onClick={() => resetCard(card.id)}
                      className="p-2 bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 完成動畫 */}
        {showCongrats.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 m-4 text-center animate-pulse">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">恭喜！</h3>
              <p className="text-gray-600 mb-4">集點卡 #{showCongrats.cardId} 已集滿5個章！</p>
              <button
                onClick={() => setShowCongrats({ show: false, cardId: null })}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                繼續兌換 →
              </button>
            </div>
          </div>
        )}

        {/* 獎勵顯示 */}
        {showReward && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 m-4 text-center">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">恭喜獲得</h3>
              <div className="text-xl font-semibold text-purple-600 mb-4">{rewardType}</div>
              <div className="flex items-center justify-center text-green-600 mb-4">
                <Award className="w-6 h-6 mr-2" />
                <span>第 {totalRedeemed} 顆扭蛋</span>
              </div>
              <p className="text-sm text-gray-500">該集點卡即將重置...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StampCard;