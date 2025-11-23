import { useState } from 'react';
import { CreditCard, Banknote, Trash2, Check, Search } from 'lucide-react';

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
  cancelled?: boolean;
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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Fonction de recherche
  const filterItems = () => {
    const query = searchQuery.toLowerCase();
    if (!query) return { categories: MENU_ITEMS, wines: WINE_MENU };

    // Filtrer les catégories de menu
    const filteredCategories = MENU_ITEMS.map(category => ({
      ...category,
      items: category.items.filter(item => 
        item.name.toLowerCase().includes(query)
      )
    })).filter(category => category.items.length > 0);

    // Filtrer les vins
    const filteredWineSubcategories = WINE_MENU.subcategories.map(subcategory => ({
      ...subcategory,
      wines: subcategory.wines.filter(wine => 
        wine.name.toLowerCase().includes(query) ||
        subcategory.name.toLowerCase().includes(query)
      )
    })).filter(subcategory => subcategory.wines.length > 0);

    const filteredWines = {
      category: WINE_MENU.category,
      subcategories: filteredWineSubcategories
    };

    return { categories: filteredCategories, wines: filteredWines };
  };

  const { categories: filteredCategories, wines: filteredWines } = filterItems();

  // Calculs pour les statistiques
  const totalCA = transactions.filter(t => !t.cancelled).reduce((sum, t) => sum + t.total, 0);
  const totalCB = transactions.filter(t => !t.cancelled && t.paymentMethod === 'cb').reduce((sum, t) => sum + t.total, 0);
  const totalEspeces = transactions.filter(t => !t.cancelled && t.paymentMethod === 'especes').reduce((sum, t) => sum + t.total, 0);
  
  // CA par produit
  const salesByProduct: { [key: string]: { quantity: number; total: number } } = {};
  transactions.filter(t => !t.cancelled).forEach(transaction => {
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
      <div className="mb-8">
        <h1 className="text-[#7d1f1f] text-center">Autobus Café - Caisse</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-8 py-4 rounded-xl transition-all shadow-sm ${
            activeTab === 'menu'
              ? 'bg-[#7d1f1f] text-[#fdfcf7] shadow-md scale-105'
              : 'bg-[#fdfcf7] text-[#7d1f1f] hover:bg-[#f5f1e8]'
          }`}
        >
          Menu
        </button>
        <button
          onClick={() => setActiveTab('historique')}
          className={`px-8 py-4 rounded-xl transition-all shadow-sm ${
            activeTab === 'historique'
              ? 'bg-[#7d1f1f] text-[#fdfcf7] shadow-md scale-105'
              : 'bg-[#fdfcf7] text-[#7d1f1f] hover:bg-[#f5f1e8]'
          }`}
        >
          Historique
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-8 py-4 rounded-xl transition-all shadow-sm ${
            activeTab === 'data'
              ? 'bg-[#7d1f1f] text-[#fdfcf7] shadow-md scale-105'
              : 'bg-[#fdfcf7] text-[#7d1f1f] hover:bg-[#f5f1e8]'
          }`}
        >
          Data
        </button>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        {/* Left Panel - Tab Content */}
        <div className="col-span-2 bg-[#fdfcf7] rounded-2xl shadow-lg p-8 overflow-y-auto">
          
          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <>
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#f5f1e8] border-2 border-[#d4c5a9] rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#8b2e2e] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-10">
                {filteredCategories.map((category, catIndex) => (
                  <div key={catIndex}>
                    <div className="mb-5 pb-2 border-b-2 border-[#d4c5a9]">
                      <h3 className="text-[#7d1f1f]">{category.category}</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
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
                {filteredWines.subcategories.length > 0 && (
                  <div>
                    <div className="mb-5 pb-2 border-b-2 border-[#d4c5a9]">
                      <h3 className="text-[#7d1f1f]">{filteredWines.category}</h3>
                    </div>
                    <div className="space-y-8">
                      {filteredWines.subcategories.map((subcategory, subIndex) => (
                        <div key={subIndex}>
                          <div className="mb-4">
                            <h4 className="text-[#7d1f1f] bg-gradient-to-r from-[#f5f1e8] to-transparent py-3 px-5 rounded-lg border-l-4 border-[#8b2e2e]">{subcategory.name}</h4>
                          </div>
                          <div className="space-y-3">
                            {subcategory.wines.map((wine, wineIndex) => (
                              <div key={wineIndex} className="bg-[#f5f1e8] p-4 rounded-xl">
                                <div className="text-[#7d1f1f] mb-3">{wine.name}</div>
                                <div className="grid grid-cols-3 gap-3">
                                  <button
                                    onClick={() => addItem({ name: `${wine.name} (Verre)`, price: wine.prices.verre })}
                                    className="bg-gradient-to-br from-[#8b2e2e] to-[#7d1f1f] hover:from-[#9d3636] hover:to-[#8b2e2e] text-[#fdfcf7] py-3 px-3 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 text-sm"
                                  >
                                    Verre<br />{wine.prices.verre} €
                                  </button>
                                  <button
                                    onClick={() => addItem({ name: `${wine.name} (Double)`, price: wine.prices.doubleVerre })}
                                    className="bg-gradient-to-br from-[#8b2e2e] to-[#7d1f1f] hover:from-[#9d3636] hover:to-[#8b2e2e] text-[#fdfcf7] py-3 px-3 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 text-sm"
                                  >
                                    Double<br />{wine.prices.doubleVerre} €
                                  </button>
                                  <button
                                    onClick={() => addItem({ name: `${wine.name} (Bouteille)`, price: wine.prices.bouteille })}
                                    className="bg-gradient-to-br from-[#8b2e2e] to-[#7d1f1f] hover:from-[#9d3636] hover:to-[#8b2e2e] text-[#fdfcf7] py-3 px-3 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 text-sm"
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
                )}

                {/* No results message */}
                {filteredCategories.length === 0 && filteredWines.subcategories.length === 0 && searchQuery && (
                  <div className="text-center py-12 text-gray-400">
                    Aucun produit trouvé pour "{searchQuery}"
                  </div>
                )}
              </div>
            </>
          )}

          {/* Historique Tab */}
          {activeTab === 'historique' && (
            <>
              <div className="mb-6">
                <h2 className="text-[#7d1f1f]">Historique des transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#d4c5a9]">
                      <th className="text-left p-4 text-[#7d1f1f]">Heure</th>
                      <th className="text-left p-4 text-[#7d1f1f]">Articles</th>
                      <th className="text-right p-4 text-[#7d1f1f]">Total</th>
                      <th className="text-center p-4 text-[#7d1f1f]">Paiement</th>
                      <th className="text-center p-4 text-[#7d1f1f]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-400">
                          Aucune transaction
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction) => (
                        <tr key={transaction.id} className={`border-b border-[#d4c5a9] hover:bg-[#f5f1e8] ${transaction.cancelled ? 'opacity-50' : ''}`}>
                          <td className="p-4 text-gray-600">
                            {transaction.timestamp.toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </td>
                          <td className="p-4 text-gray-600">
                            {transaction.items.map((item, i) => item.name).join(', ')}
                          </td>
                          <td className={`p-4 text-right ${transaction.cancelled ? 'text-gray-400 line-through' : 'text-[#7d1f1f]'}`}>
                            {transaction.total.toFixed(2)} €
                          </td>
                          <td className="p-4 text-center">
                            {transaction.cancelled ? (
                              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                                Annulé
                              </span>
                            ) : transaction.paymentMethod === 'cb' ? (
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
                          <td className="p-4 text-center">
                            {!transaction.cancelled && (
                              <button
                                onClick={() => deleteTransaction(transaction.id)}
                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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
              <div className="mb-8">
                <h2 className="text-[#7d1f1f]">Statistiques</h2>
              </div>
              
              {/* Résumé général */}
              <div className="grid grid-cols-3 gap-6 mb-10">
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
                <div className="mb-5 pb-2 border-b-2 border-[#d4c5a9]">
                  <h3 className="text-[#7d1f1f]">Ventes par produit</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#d4c5a9]">
                        <th className="text-left p-4 text-[#7d1f1f]">Produit</th>
                        <th className="text-center p-4 text-[#7d1f1f]">Quantité</th>
                        <th className="text-right p-4 text-[#7d1f1f]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(salesByProduct).length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-12 text-gray-400">
                            Aucune vente
                          </td>
                        </tr>
                      ) : (
                        Object.entries(salesByProduct)
                          .sort((a, b) => b[1].total - a[1].total)
                          .map(([productName, data]) => (
                            <tr key={productName} className="border-b border-[#d4c5a9] hover:bg-[#f5f1e8]">
                              <td className="p-4 text-gray-700">{productName}</td>
                              <td className="p-4 text-center text-gray-600">{data.quantity}</td>
                              <td className="p-4 text-right text-[#7d1f1f]">
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
        <div className="bg-[#fdfcf7] rounded-2xl shadow-lg p-8 flex flex-col">
          <div className="mb-6 pb-3 border-b-2 border-[#d4c5a9]">
            <h2 className="text-[#7d1f1f]">Commande en cours</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-6 space-y-3">
            {currentOrder.length === 0 ? (
              <p className="text-gray-400 text-center py-12">Aucun article</p>
            ) : (
              currentOrder.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-[#f5f1e8] rounded-xl shadow-sm">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-[#7d1f1f]">{item.price.toFixed(2)} €</span>
                </div>
              ))
            )}
          </div>

          {/* Total */}
          <div className="border-t-2 border-[#d4c5a9] pt-5 mb-6">
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