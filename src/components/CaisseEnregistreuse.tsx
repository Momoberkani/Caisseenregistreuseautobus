import { useState } from 'react';
import { CreditCard, Banknote, Trash2, Check } from 'lucide-react';

interface Item {
  name: string;
  price: number;
}

interface WineItem {
  name: string;
  prices: {
    verre: number;
    doubleVerre: number;
    bouteille: number;
  };
}

interface MenuCategory {
  category: string;
  items: Item[];
}

interface WineCategory {
  category: string;
  subcategories: {
    name: string;
    wines: WineItem[];
  }[];
}

interface Transaction {
  id: string;
  items: Item[];
  total: number;
  paymentMethod: 'cb' | 'especes';
  timestamp: Date;
}

const MENU_ITEMS: MenuCategory[] = [
  {
    category: 'Apéritifs',
    items: [
      { name: 'Ricard', price: 4.00 },
    ]
  },
  {
    category: 'Cocktails',
    items: [
      { name: 'Cocktail', price: 8.00 },
      { name: 'St Germain Spritz', price: 10.00 },
    ]
  },
  {
    category: 'Bières',
    items: [
      { name: 'Demi', price: 3.50 },
      { name: 'Demi St Omer', price: 4.00 },
      { name: 'Pinte', price: 6.00 },
      { name: 'Pinte St Omer', price: 8.00 },
    ]
  }
];

const WINE_MENU: WineCategory = {
  category: 'Vins',
  subcategories: [
    {
      name: 'Bulles',
      wines: [
        { name: 'Prosecco DOC - Riccadonna', prices: { verre: 7, doubleVerre: 12, bouteille: 26 } },
        { name: 'Champagne brut - Maxime Taillefert', prices: { verre: 11, doubleVerre: 19, bouteille: 54 } },
      ]
    },
    {
      name: 'Blancs',
      wines: [
        { name: 'Menetou Salon - Domaine Chavet', prices: { verre: 7, doubleVerre: 13, bouteille: 31 } },
        { name: 'Saint-Véran - Domaine du Paradis', prices: { verre: 7, doubleVerre: 13, bouteille: 30 } },
        { name: 'Viognier - Paul Mas Estate', prices: { verre: 6, doubleVerre: 10, bouteille: 22 } },
        { name: 'IGP Côtes de Gascogne - Plaimont', prices: { verre: 6, doubleVerre: 10, bouteille: 22 } },
        { name: 'Bordeaux AOP - Altitude', prices: { verre: 6, doubleVerre: 10, bouteille: 22 } },
      ]
    },
    {
      name: 'Rouges',
      wines: [
        { name: 'Côteaux bourguignons - Bouchard Aîné', prices: { verre: 6, doubleVerre: 11, bouteille: 24 } },
        { name: 'Chateauneuf-du-Pape - Clos de l\'Oratoire', prices: { verre: 14, doubleVerre: 25, bouteille: 78 } },
        { name: 'Saint-Julien - Château Moulin de la Bridane', prices: { verre: 9, doubleVerre: 16, bouteille: 45 } },
        { name: 'Pic Saint Loup - Héritage', prices: { verre: 6, doubleVerre: 11, bouteille: 24 } },
        { name: 'Bordeaux AOP - Altitude', prices: { verre: 6, doubleVerre: 10, bouteille: 22 } },
      ]
    },
    {
      name: 'Rosés',
      wines: [
        { name: 'Côtes de Provence - Estandon Héritage', prices: { verre: 6, doubleVerre: 11, bouteille: 24 } },
        { name: 'Gris Blanc - Gérard Bertrand', prices: { verre: 6, doubleVerre: 11, bouteille: 24 } },
        { name: 'Bordeaux rosé - Altitude', prices: { verre: 6, doubleVerre: 10, bouteille: 22 } },
      ]
    }
  ]
};

export function CaisseEnregistreuse() {
  const [currentOrder, setCurrentOrder] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'historique' | 'data'>('menu');

  const addItem = (item: Item) => {
    setCurrentOrder([...currentOrder, item]);
  };

  const removeLastItem = () => {
    if (currentOrder.length > 0) {
      setCurrentOrder(currentOrder.slice(0, -1));
    }
  };

  const clearOrder = () => {
    setCurrentOrder([]);
  };

  const total = currentOrder.reduce((sum, item) => sum + item.price, 0);

  const processPayment = (method: 'cb' | 'especes') => {
    if (currentOrder.length === 0) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      items: [...currentOrder],
      total,
      paymentMethod: method,
      timestamp: new Date(),
    };

    setTransactions([transaction, ...transactions]);
    setCurrentOrder([]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Calculs pour les statistiques
  const totalCA = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalCB = transactions.filter(t => t.paymentMethod === 'cb').reduce((sum, t) => sum + t.total, 0);
  const totalEspeces = transactions.filter(t => t.paymentMethod === 'especes').reduce((sum, t) => sum + t.total, 0);
  
  // CA par produit
  const salesByProduct: { [key: string]: { quantity: number; total: number } } = {};
  transactions.forEach(transaction => {
    transaction.items.forEach(item => {
      if (!salesByProduct[item.name]) {
        salesByProduct[item.name] = { quantity: 0, total: 0 };
      }
      salesByProduct[item.name].quantity += 1;
      salesByProduct[item.name].total += item.price;
    });
  });

  return (
    <div className="max-w-7xl mx-auto p-6 h-screen flex flex-col bg-[#f5f1e8]">
      <div className="mb-6">
        <h1 className="text-[#7d1f1f]">Autobus Café - Caisse</h1>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === 'menu'
              ? 'bg-[#7d1f1f] text-[#fdfcf7] shadow-md'
              : 'bg-[#fdfcf7] text-[#7d1f1f] hover:bg-[#f5f1e8]'
          }`}
        >
          Menu
        </button>
        <button
          onClick={() => setActiveTab('historique')}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === 'historique'
              ? 'bg-[#7d1f1f] text-[#fdfcf7] shadow-md'
              : 'bg-[#fdfcf7] text-[#7d1f1f] hover:bg-[#f5f1e8]'
          }`}
        >
          Historique
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === 'data'
              ? 'bg-[#7d1f1f] text-[#fdfcf7] shadow-md'
              : 'bg-[#fdfcf7] text-[#7d1f1f] hover:bg-[#f5f1e8]'
          }`}
        >
          Data
        </button>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        {/* Left Panel - Tab Content */}
        <div className="col-span-2 bg-[#fdfcf7] rounded-2xl shadow-lg p-6 overflow-y-auto">
          
          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <>
              <h2 className="text-[#7d1f1f] mb-4">Menu</h2>
              <div className="space-y-6">
                {MENU_ITEMS.map((category, catIndex) => (
                  <div key={catIndex}>
                    <h3 className="text-[#7d1f1f] mb-3">{category.category}</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {category.items.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => addItem(item)}
                          className="bg-gradient-to-br from-[#8b2e2e] to-[#7d1f1f] hover:from-[#9d3636] hover:to-[#8b2e2e] text-[#fdfcf7] p-6 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-2"
                        >
                          <span className="text-center">{item.name}</span>
                          <span className="opacity-90">{item.price.toFixed(2)} €</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Wine Menu */}
                <div>
                  <h3 className="text-[#7d1f1f] mb-3">{WINE_MENU.category}</h3>
                  {WINE_MENU.subcategories.map((subcategory, subIndex) => (
                    <div key={subIndex} className="mb-6">
                      <h4 className="text-[#7d1f1f] bg-gradient-to-r from-[#f5f1e8] to-transparent py-2 px-4 rounded-lg mb-3 border-l-4 border-[#8b2e2e]">{subcategory.name}</h4>
                      <div className="space-y-2">
                        {subcategory.wines.map((wine, wineIndex) => (
                          <div key={wineIndex} className="bg-[#f5f1e8] p-3 rounded-lg">
                            <div className="text-[#7d1f1f] mb-2">{wine.name}</div>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => addItem({ name: `${wine.name} (Verre)`, price: wine.prices.verre })}
                                className="bg-gradient-to-br from-[#8b2e2e] to-[#7d1f1f] hover:from-[#9d3636] hover:to-[#8b2e2e] text-[#fdfcf7] py-2 px-3 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 text-sm"
                              >
                                Verre<br />{wine.prices.verre} €
                              </button>
                              <button
                                onClick={() => addItem({ name: `${wine.name} (Double)`, price: wine.prices.doubleVerre })}
                                className="bg-gradient-to-br from-[#8b2e2e] to-[#7d1f1f] hover:from-[#9d3636] hover:to-[#8b2e2e] text-[#fdfcf7] py-2 px-3 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 text-sm"
                              >
                                Double<br />{wine.prices.doubleVerre} €
                              </button>
                              <button
                                onClick={() => addItem({ name: `${wine.name} (Bouteille)`, price: wine.prices.bouteille })}
                                className="bg-gradient-to-br from-[#8b2e2e] to-[#7d1f1f] hover:from-[#9d3636] hover:to-[#8b2e2e] text-[#fdfcf7] py-2 px-3 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 text-sm"
                              >
                                Bouteille<br />{wine.prices.bouteille} €
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Historique Tab */}
          {activeTab === 'historique' && (
            <>
              <h2 className="text-[#7d1f1f] mb-4">Historique des transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#d4c5a9]">
                      <th className="text-left p-3 text-[#7d1f1f]">Heure</th>
                      <th className="text-left p-3 text-[#7d1f1f]">Articles</th>
                      <th className="text-right p-3 text-[#7d1f1f]">Total</th>
                      <th className="text-center p-3 text-[#7d1f1f]">Paiement</th>
                      <th className="text-center p-3 text-[#7d1f1f]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">
                          Aucune transaction
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-[#d4c5a9] hover:bg-[#f5f1e8]">
                          <td className="p-3 text-gray-600">
                            {transaction.timestamp.toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </td>
                          <td className="p-3 text-gray-600">
                            {transaction.items.map((item, i) => item.name).join(', ')}
                          </td>
                          <td className="p-3 text-right text-[#7d1f1f]">
                            {transaction.total.toFixed(2)} €
                          </td>
                          <td className="p-3 text-center">
                            {transaction.paymentMethod === 'cb' ? (
                              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                <CreditCard className="w-4 h-4" />
                                CB
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                <Banknote className="w-4 h-4" />
                                Espèces
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => deleteTransaction(transaction.id)}
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <>
              <h2 className="text-[#7d1f1f] mb-6">Statistiques</h2>
              
              {/* Résumé général */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-[#8b2e2e] to-[#7d1f1f] text-[#fdfcf7] p-6 rounded-xl shadow-md">
                  <div className="text-sm opacity-80 mb-2">Chiffre d'affaires total</div>
                  <div className="text-3xl">{totalCA.toFixed(2)} €</div>
                </div>
                <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md">
                  <div className="text-sm opacity-80 mb-2">Paiements CB</div>
                  <div className="text-3xl">{totalCB.toFixed(2)} €</div>
                </div>
                <div className="bg-green-600 text-white p-6 rounded-xl shadow-md">
                  <div className="text-sm opacity-80 mb-2">Paiements Espèces</div>
                  <div className="text-3xl">{totalEspeces.toFixed(2)} €</div>
                </div>
              </div>

              {/* Ventes par produit */}
              <div>
                <h3 className="text-[#7d1f1f] mb-4">Ventes par produit</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#d4c5a9]">
                        <th className="text-left p-3 text-[#7d1f1f]">Produit</th>
                        <th className="text-center p-3 text-[#7d1f1f]">Quantité</th>
                        <th className="text-right p-3 text-[#7d1f1f]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(salesByProduct).length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-8 text-gray-400">
                            Aucune vente
                          </td>
                        </tr>
                      ) : (
                        Object.entries(salesByProduct)
                          .sort((a, b) => b[1].total - a[1].total)
                          .map(([productName, data]) => (
                            <tr key={productName} className="border-b border-[#d4c5a9] hover:bg-[#f5f1e8]">
                              <td className="p-3 text-gray-700">{productName}</td>
                              <td className="p-3 text-center text-gray-600">{data.quantity}</td>
                              <td className="p-3 text-right text-[#7d1f1f]">
                                {data.total.toFixed(2)} €
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Current Order - Always visible on the right */}
        <div className="bg-[#fdfcf7] rounded-2xl shadow-lg p-6 flex flex-col">
          <h2 className="text-[#7d1f1f] mb-4">Commande en cours</h2>
          
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {currentOrder.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Aucun article</p>
            ) : (
              currentOrder.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-[#f5f1e8] rounded-lg">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-[#7d1f1f]">{item.price.toFixed(2)} €</span>
                </div>
              ))
            )}
          </div>

          {/* Total */}
          <div className="border-t-2 border-[#d4c5a9] pt-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700">Total</span>
              <span className="text-[#7d1f1f]">{total.toFixed(2)} €</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => processPayment('cb')}
              disabled={currentOrder.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-5 h-5" />
              <span>Payer par CB</span>
            </button>

            <button
              onClick={() => processPayment('especes')}
              disabled={currentOrder.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white p-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              <Banknote className="w-5 h-5" />
              <span>Payer en espèces</span>
            </button>

            <button
              onClick={removeLastItem}
              disabled={currentOrder.length === 0}
              className="w-full bg-[#c85a3a] hover:bg-[#b54e31] disabled:bg-gray-300 text-white p-3 rounded-xl shadow-md transition-all disabled:cursor-not-allowed"
            >
              Retirer dernier article
            </button>

            <button
              onClick={clearOrder}
              disabled={currentOrder.length === 0}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white p-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
              <span>Annuler</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}