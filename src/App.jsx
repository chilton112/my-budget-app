import React, { useState, useMemo, useEffect } from 'react';
import { 
  PlusCircle, 
  ArrowRightLeft, 
  Wallet, 
  LayoutDashboard, 
  ListPlus,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info
} from 'lucide-react';

const initialCategories = [
  // Personal
  { id: 'p1', name: 'Joint Contribution', group: 'Needs', assigned: 1500, dueDate: 1, budgetId: 'personal' },
  { id: 'p2', name: 'Groceries', group: 'Needs', assigned: 400, dueDate: null, budgetId: 'personal' },
  { id: 'p3', name: 'Car Payment', group: 'Needs', assigned: 350, dueDate: 15, budgetId: 'personal' },
  { id: 'p4', name: 'Dining Out', group: 'Wants', assigned: 150, dueDate: null, budgetId: 'personal' },
  { id: 'p5', name: 'Entertainment', group: 'Wants', assigned: 100, dueDate: null, budgetId: 'personal' },
  { id: 'p6', name: 'Emergency Fund', group: 'Savings', assigned: 300, dueDate: null, budgetId: 'personal' },
  { id: 'p7', name: 'Vacation', group: 'Savings', assigned: 200, dueDate: null, budgetId: 'personal' },
  
  // Joint
  { id: 'j1', name: 'Rent/Mortgage', group: 'Needs', assigned: 2000, dueDate: 1, budgetId: 'joint' },
  { id: 'j2', name: 'Utilities', group: 'Needs', assigned: 250, dueDate: 5, budgetId: 'joint' },
  { id: 'j3', name: 'Household Goods', group: 'Wants', assigned: 100, dueDate: null, budgetId: 'joint' },
];

const initialTransactions = [
  { id: 't1', date: '2026-06-02', payee: 'Transfer to Joint', categoryId: 'p1', amount: -1500, budgetId: 'personal' },
  { id: 't2', date: '2026-06-03', payee: 'Whole Foods', categoryId: 'p2', amount: -85.50, budgetId: 'personal' },
  { id: 't3', date: '2026-06-10', payee: 'Netflix', categoryId: 'p5', amount: -15.99, budgetId: 'personal' },
  { id: 't4', date: '2026-06-01', payee: 'Landlord', categoryId: 'j1', amount: -2000, budgetId: 'joint' },
  { id: 't5', date: '2026-06-04', payee: 'Electric Co', categoryId: 'j2', amount: -120, budgetId: 'joint' },
];

const initialPaychecks = [
  { id: 'chk1', date: '2026-06-01', amount: 1500, budgetId: 'personal' },
  { id: 'chk2', date: '2026-06-15', amount: 1500, budgetId: 'personal' },
];

const initialAllocations = [
  { paycheckId: 'chk1', categoryId: 'p1', amount: 1500 }
];

export default function BudgetApp() {
  const [activeBudget, setActiveBudget] = useState(() => {
    const saved = localStorage.getItem('budget_activeWorkspace');
    return saved || 'personal';
  });
  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('budget_currentView');
    return saved || 'dashboard';
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const saved = localStorage.getItem('budget_currentMonth');
    return saved ? new Date(saved) : new Date(2026, 5, 1);
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('budget_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('budget_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });
  const [paychecks, setPaychecks] = useState(() => {
    const saved = localStorage.getItem('budget_paychecks');
    return saved ? JSON.parse(saved) : initialPaychecks;
  });
  const [allocations, setAllocations] = useState(() => {
    const saved = localStorage.getItem('budget_allocations');
    return saved ? JSON.parse(saved) : initialAllocations;
  });

  // Save to Local Storage whenever data changes
  useEffect(() => { localStorage.setItem('budget_activeWorkspace', activeBudget); }, [activeBudget]);
  useEffect(() => { localStorage.setItem('budget_currentView', currentView); }, [currentView]);
  useEffect(() => { localStorage.setItem('budget_currentMonth', currentMonth.toISOString()); }, [currentMonth]);
  useEffect(() => { localStorage.setItem('budget_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('budget_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('budget_paychecks', JSON.stringify(paychecks)); }, [paychecks]);
  useEffect(() => { localStorage.setItem('budget_allocations', JSON.stringify(allocations)); }, [allocations]);

  // Form States
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  
  const [newCatName, setNewCatName] = useState('');
  const [newCatGroup, setNewCatGroup] = useState('Needs');
  const [newCatDueDate, setNewCatDueDate] = useState('');

  const [newTxDate, setNewTxDate] = useState('');
  const [newTxPayee, setNewTxPayee] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxCat, setNewTxCat] = useState('');
  const [newTxType, setNewTxType] = useState('expense');

  const [newCheckDate, setNewCheckDate] = useState('');
  const [newCheckAmount, setNewCheckAmount] = useState('');

  const { expectedIncomeForMonth, totalIncome, totalAssigned, readyToAssign, groupedCategories, currentTransactions, currentPaychecks } = useMemo(() => {
    const currentTransactions = transactions.filter(t => t.budgetId === activeBudget);
    let currentCategories = categories.filter(c => c.budgetId === activeBudget);
    const currentPaychecks = paychecks.filter(p => p.budgetId === activeBudget);

    currentCategories = currentCategories.sort((a, b) => {
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate - b.dueDate;
    });

    const activeMonthPaychecks = currentPaychecks.filter(p => {
      const pDate = new Date(p.date + 'T00:00:00');
      return pDate.getMonth() === currentMonth.getMonth() && pDate.getFullYear() === currentMonth.getFullYear();
    });
    const expectedIncomeForMonth = activeMonthPaychecks.reduce((sum, p) => sum + p.amount, 0);

    const totalIncome = currentTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalAssigned = currentCategories.reduce((sum, c) => sum + c.assigned, 0);
    const readyToAssign = totalIncome - totalAssigned;

    const catData = currentCategories.map(cat => {
      const activity = currentTransactions
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...cat,
        activity,
        available: cat.assigned + activity
      };
    });

    const groupedCategories = {
      'Needs': catData.filter(c => c.group === 'Needs'),
      'Wants': catData.filter(c => c.group === 'Wants'),
      'Savings': catData.filter(c => c.group === 'Savings'),
    };

    return { expectedIncomeForMonth, totalIncome, totalAssigned, readyToAssign, groupedCategories, currentTransactions, currentPaychecks };
  }, [activeBudget, categories, transactions, paychecks, currentMonth]);

  const rule503020 = useMemo(() => {
    if (totalAssigned === 0) return { needs: 0, wants: 0, savings: 0 };
    const needs = groupedCategories['Needs']?.reduce((sum, c) => sum + c.assigned, 0) || 0;
    const wants = groupedCategories['Wants']?.reduce((sum, c) => sum + c.assigned, 0) || 0;
    const savings = groupedCategories['Savings']?.reduce((sum, c) => sum + c.assigned, 0) || 0;
    
    return {
      needs: Math.round((needs / totalAssigned) * 100),
      wants: Math.round((wants / totalAssigned) * 100),
      savings: Math.round((savings / totalAssigned) * 100)
    };
  }, [groupedCategories, totalAssigned]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const paycheckDates = currentPaychecks
    .filter(p => {
      const d = new Date(p.date + 'T00:00:00');
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    })
    .map(p => new Date(p.date + 'T00:00:00').getDate());

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const handleEditCategoryName = (id, newName) => {
    if (!newName.trim()) return;
    setCategories(cats => cats.map(c => c.id === id ? { ...c, name: newName.trim() } : c));
    setEditingCategoryId(null);
  };

  const handleDeleteCategory = (id) => {
    setCategories(cats => cats.filter(c => c.id !== id));
    setTransactions(txs => txs.filter(t => t.categoryId !== id));
    setAllocations(al => al.filter(a => a.categoryId !== id));
  };

  const handleAssignChange = (categoryId, newAssignedStr) => {
    const newAssigned = parseFloat(newAssignedStr) || 0;
    setCategories(cats => cats.map(c => c.id === categoryId ? { ...c, assigned: newAssigned } : c));
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName) return;
    const newCat = {
      id: `c${Date.now()}`,
      name: newCatName,
      group: newCatGroup,
      assigned: 0,
      dueDate: newCatDueDate ? parseInt(newCatDueDate) : null,
      budgetId: activeBudget
    };
    setCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatDueDate('');
    setShowCategoryForm(false);
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!newTxDate || !newTxPayee || !newTxAmount) return;
    
    let amount = parseFloat(newTxAmount);
    if (newTxType === 'expense') amount = -Math.abs(amount);
    if (newTxType === 'income') amount = Math.abs(amount);

    const newTx = {
      id: `t${Date.now()}`,
      date: newTxDate,
      payee: newTxPayee,
      amount,
      categoryId: newTxType === 'income' ? null : newTxCat,
      budgetId: activeBudget
    };
    setTransactions([newTx, ...transactions]);
    setNewTxPayee('');
    setNewTxAmount('');
    setShowTransactionForm(false);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(txs => txs.filter(t => t.id !== id));
  };

  const handleAddPaycheck = (e) => {
    e.preventDefault();
    if (!newCheckDate || !newCheckAmount) return;
    const newCheck = {
      id: `chk${Date.now()}`,
      date: newCheckDate,
      amount: parseFloat(newCheckAmount),
      budgetId: activeBudget
    };
    setPaychecks([...paychecks, newCheck].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setNewCheckDate('');
    setNewCheckAmount('');
  };

  const handleDeletePaycheck = (id) => {
    setPaychecks(checks => checks.filter(c => c.id !== id));
    setAllocations(allocs => allocs.filter(a => a.paycheckId !== id));
  };

  const handleAllocationChange = (paycheckId, categoryId, amountStr) => {
    const amount = parseFloat(amountStr) || 0;
    setAllocations(prev => {
      const existing = prev.find(a => a.paycheckId === paycheckId && a.categoryId === categoryId);
      if (existing) {
        return prev.map(a => a === existing ? { ...a, amount } : a);
      } else {
        return [...prev, { paycheckId, categoryId, amount }];
      }
    });
  };

  const getPaycheckLeftover = (paycheckId, amount) => {
    const allocated = allocations.filter(a => a.paycheckId === paycheckId).reduce((sum, a) => sum + a.amount, 0);
    return amount - allocated;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation Tabs */}
        <nav className="flex justify-center mb-8">
          <div className="flex bg-slate-200/60 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${currentView === 'dashboard' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              onClick={() => setCurrentView('planner')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${currentView === 'planner' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ListPlus size={18} /> Paycheck Planner
            </button>
          </div>
        </nav>

        {/* Global Header & Workspace Toggle */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Wallet size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Active Workspace</h1>
                <p className="text-sm text-slate-500">{activeBudget === 'personal' ? 'Personal Finances' : 'Joint Account'}</p>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-12 bg-slate-200"></div>
            
            {/* Compact Calendar */}
            <div className="flex flex-col items-center p-2 bg-slate-50 rounded-xl border border-slate-100 shadow-inner w-[180px]">
              <div className="flex items-center justify-between w-full mb-1">
                <button onClick={prevMonth} className="p-0.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"><ChevronLeft size={14} /></button>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <CalendarIcon size={12} className="text-emerald-600" />
                  {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
                </div>
                <button onClick={nextMonth} className="p-0.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"><ChevronRight size={14} /></button>
              </div>
              <div className="grid grid-cols-7 gap-x-1 gap-y-0.5 text-[9px] w-full text-center">
                {['S','M','T','W','T','F','S'].map((d, i) => <div key={`day-header-${i}`} className="font-bold text-slate-400">{d}</div>)}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const hasPaycheck = paycheckDates.includes(day);
                  return (
                    <div key={day} className={`w-5 h-5 mx-auto flex items-center justify-center rounded-full transition-all ${hasPaycheck ? 'bg-emerald-200 text-emerald-800 font-bold border border-emerald-300 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>
                      {day}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl self-center lg:self-start flex-shrink-0">
            <button
              onClick={() => setActiveBudget('personal')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeBudget === 'personal' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Personal
            </button>
            <button
              onClick={() => setActiveBudget('joint')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeBudget === 'joint' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Joint
            </button>
          </div>
        </header>

        {}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Ready to Assign Banner */}
            <div className={`p-6 rounded-2xl shadow-sm border text-center ${readyToAssign >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 ${readyToAssign >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                Ready to Assign
              </h2>
              <div className={`text-5xl font-black tracking-tighter ${readyToAssign >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                ${readyToAssign.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {readyToAssign < 0 && <p className="text-rose-500 text-sm mt-2 font-medium">You've assigned more money than you have!</p>}
            </div>

            {/* Philosophy Tracker */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800">50/30/20 Target Tracker</h3>
                <a href="https://www.investopedia.com/ask/answers/022815/what-502030-budget-rule.asp" target="_blank" rel="noreferrer" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  <Info size={14} /> Learn More
                </a>
              </div>
              <p className="text-sm text-slate-500 mb-4 max-w-3xl">
                The 50/30/20 rule is a simple framework for managing your money. It suggests dividing your after-tax income into three categories: 50% for Needs (Fixed Expenses), 30% for Wants (Variable Expenses), and 20% for Savings or paying off debt. 
              </p>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 w-full flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-600">Needs (Target: 50%{expectedIncomeForMonth > 0 ? ` or $${(expectedIncomeForMonth * 0.5).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : ''})</span>
                    <span className={`font-bold ${rule503020.needs > 50 ? 'text-rose-500' : 'text-blue-600'}`}>{rule503020.needs}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${rule503020.needs > 50 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(rule503020.needs, 100)}%` }}></div>
                  </div>
                </div>
                <div className="flex-1 w-full flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-600">Wants (Target: 30%{expectedIncomeForMonth > 0 ? ` or $${(expectedIncomeForMonth * 0.3).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : ''})</span>
                    <span className={`font-bold ${rule503020.wants > 30 ? 'text-rose-500' : 'text-amber-500'}`}>{rule503020.wants}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${rule503020.wants > 30 ? 'bg-rose-500' : 'bg-amber-400'}`} style={{ width: `${Math.min(rule503020.wants, 100)}%` }}></div>
                  </div>
                </div>
                <div className="flex-1 w-full flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-600">Savings (Target: 20%{expectedIncomeForMonth > 0 ? ` or $${(expectedIncomeForMonth * 0.2).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : ''})</span>
                    <span className={`font-bold ${rule503020.savings < 20 ? 'text-amber-500' : 'text-emerald-500'}`}>{rule503020.savings}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${rule503020.savings < 20 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${Math.min(rule503020.savings, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {}
            {/* Categories Loop */}
            <div className="space-y-6">
              {['Needs', 'Wants', 'Savings'].map(groupName => {
                const cats = groupedCategories[groupName];
                if (!cats) return null;

                return (
                  <div key={groupName} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">{groupName}</h3>
                      <div className="text-sm text-slate-500 font-medium grid grid-cols-12 gap-4 w-1/2 min-w-[300px]">
                        <div className="col-span-4 text-right">Assigned</div>
                        <div className="col-span-4 text-right">Activity</div>
                        <div className="col-span-4 text-right">Available</div>
                      </div>
                    </div>
                    
                    {cats.map(cat => (
                      <div key={cat.id} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50 transition-colors">
                        {/* Name & Edit/Delete Logic */}
                        <div className="col-span-6 md:col-span-6 font-medium text-slate-800 flex items-center gap-2 group">
                          {editingCategoryId === cat.id ? (
                            <div className="flex items-center gap-2 w-full max-w-[250px]">
                              <input
                                autoFocus
                                type="text"
                                value={editingCategoryName}
                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEditCategoryName(cat.id, editingCategoryName);
                                  if (e.key === 'Escape') setEditingCategoryId(null);
                                }}
                                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                              />
                              <button onClick={() => handleEditCategoryName(cat.id, editingCategoryName)} className="text-emerald-600 hover:text-emerald-700"><Check size={16}/></button>
                              <button onClick={() => setEditingCategoryId(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                            </div>
                          ) : (
                            <>
                              <span className="truncate">{cat.name}</span>
                              {cat.dueDate && (
                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                                  Due: {cat.dueDate}{[1,21,31].includes(cat.dueDate) ? 'st' : [2,22].includes(cat.dueDate) ? 'nd' : [3,23].includes(cat.dueDate) ? 'rd' : 'th'}
                                </span>
                              )}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                                <button onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }} className="text-slate-400 hover:text-blue-600 p-1">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-400 hover:text-rose-600 p-1">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* Assigned Input */}
                        <div className="col-span-2 md:col-span-2 text-right relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                          <input 
                            type="number" 
                            value={cat.assigned || ''} 
                            onChange={(e) => handleAssignChange(cat.id, e.target.value)}
                            className="w-full text-right py-1 pl-6 pr-2 rounded bg-slate-100 border-transparent focus:border-emerald-500 focus:bg-white focus:ring-0 text-sm font-medium transition-all"
                          />
                        </div>
                        
                        {/* Activity */}
                        <div className="col-span-2 md:col-span-2 text-right text-sm">
                          <span className={cat.activity < 0 ? 'text-slate-600 font-medium' : 'text-slate-400'}>
                            ${Math.abs(cat.activity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        {/* Available */}
                        <div className="col-span-2 md:col-span-2 text-right flex items-center justify-end gap-2">
                          {cat.available > cat.assigned && (
                            <div className="text-amber-500 group relative cursor-help">
                              <AlertCircle size={16} />
                              <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10 text-center">
                                Funds rolled over! Available is higher than this month's assigned target.
                              </div>
                            </div>
                          )}
                          <span className={`text-sm font-bold bg-slate-100 px-3 py-1 rounded-full ${cat.available < 0 ? 'bg-rose-100 text-rose-700' : cat.available > 0 ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500'}`}>
                            ${cat.available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Category Trigger */}
                    <div className="p-2 bg-slate-50 border-t border-slate-100">
                      {showCategoryForm ? (
                        <form onSubmit={handleAddCategory} className="flex gap-2 p-2">
                          <input type="text" placeholder="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" autoFocus />
                          <input type="number" placeholder="Due Day (1-31)" min="1" max="31" value={newCatDueDate} onChange={e => setNewCatDueDate(e.target.value)} className="w-32 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                          <select value={newCatGroup} onChange={e => setNewCatGroup(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="Needs">Needs</option>
                            <option value="Wants">Wants</option>
                            <option value="Savings">Savings</option>
                          </select>
                          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700">Add</button>
                          <button type="button" onClick={() => setShowCategoryForm(false)} className="text-slate-500 px-3 hover:text-slate-800">Cancel</button>
                        </form>
                      ) : (
                        <button onClick={() => { setShowCategoryForm(true); setNewCatGroup(groupName); }} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded transition-colors">
                          <PlusCircle size={16} /> Add Category
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {}
            {/* Transactions Section */}
            <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-800 px-6 py-4 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center gap-2"><ArrowRightLeft size={18}/> Transactions</h3>
                <button onClick={() => setShowTransactionForm(!showTransactionForm)} className="flex items-center gap-1 text-sm font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors">
                  <PlusCircle size={16}/> New Transaction
                </button>
              </div>

              {showTransactionForm && (
                <form onSubmit={handleAddTransaction} className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                    <input type="date" required value={newTxDate} onChange={e => setNewTxDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Payee</label>
                    <input type="text" required placeholder="Who/Where?" value={newTxPayee} onChange={e => setNewTxPayee(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                    <select value={newTxType} onChange={e => { setNewTxType(e.target.value); if(e.target.value === 'income') setNewTxCat(''); }} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-sm">
                      <option value="expense">Outflow</option>
                      <option value="income">Inflow (Income)</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                    <select disabled={newTxType === 'income'} required={newTxType === 'expense'} value={newTxCat} onChange={e => setNewTxCat(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-sm disabled:opacity-50 disabled:bg-slate-100">
                      <option value="">{newTxType === 'income' ? 'Ready to Assign' : 'Select...'}</option>
                      {categories.filter(c => c.budgetId === activeBudget).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Amount</label>
                    <div className="flex gap-2">
                      <input type="number" step="0.01" required placeholder="0.00" value={newTxAmount} onChange={e => setNewTxAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                    </div>
                  </div>
                  <div className="md:col-span-6 flex justify-end gap-2 mt-2">
                     <button type="button" onClick={() => setShowTransactionForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded">Cancel</button>
                     <button type="submit" className="px-4 py-2 text-sm bg-slate-800 text-white rounded hover:bg-slate-700 font-semibold">Save Transaction</button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-slate-100">
                {currentTransactions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No transactions yet.</div>
                ) : (
                  currentTransactions.map(t => (
                    <div key={t.id} className="p-4 flex items-center hover:bg-slate-50 transition-colors group">
                      <div className="w-32 text-sm text-slate-500">{new Date(t.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">{t.payee}</div>
                        <div className="text-xs text-slate-500">{t.categoryId ? categories.find(c => c.id === t.categoryId)?.name : 'Ready to Assign'}</div>
                      </div>
                      <div className={`font-medium w-32 text-right ${t.amount > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {t.amount > 0 ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                      </div>
                      <div className="w-10 flex justify-end">
                        <button onClick={() => handleDeleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {}
        {currentView === 'planner' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow text-white">
              <h2 className="text-xl font-bold mb-2">Paycheck Planner</h2>
              <p className="text-blue-100 text-sm max-w-2xl">Plan your upcoming paychecks. Allocate funds to your categories before the money even hits your account to ensure every bill is covered.</p>
            </div>

            {/* Add Paycheck Form */}
            <form onSubmit={handleAddPaycheck} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Expected Date</label>
                <input type="date" required value={newCheckDate} onChange={e => setNewCheckDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Expected Amount</label>
                <input type="number" step="0.01" required value={newCheckAmount} onChange={e => setNewCheckAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <button type="submit" className="bg-slate-800 text-white px-6 py-2 rounded font-semibold hover:bg-slate-700 transition-colors w-full md:w-auto h-[42px]">
                Add Paycheck
              </button>
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-semibold w-1/4">Category</th>
                    <th className="p-4 font-semibold w-32 text-center bg-slate-100 border-x border-slate-200">Goal Target</th>
                    {currentPaychecks.map((check, index) => {
                      const checkDate = new Date(check.date + 'T00:00:00');
                      const left = getPaycheckLeftover(check.id, check.amount);
                      return (
                        <th key={check.id} className="p-4 min-w-[160px] align-top">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-800">Check {index + 1}</span>
                            <button onClick={() => handleDeletePaycheck(check.id)} className="text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={14}/></button>
                          </div>
                          <div className="text-xs font-normal text-slate-500 mb-2">{checkDate.toLocaleDateString()}</div>
                          <div className="bg-slate-100 p-2 rounded border border-slate-200">
                            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Left to Plan</div>
                            <div className={`font-bold text-base ${left < 0 ? 'text-rose-600' : left === 0 ? 'text-slate-400' : 'text-emerald-600'}`}>
                              ${left.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.filter(c => c.budgetId === activeBudget)
                    .sort((a, b) => {
                      if (a.dueDate === null) return 1;
                      if (b.dueDate === null) return -1;
                      return a.dueDate - b.dueDate;
                    })
                    .map(cat => {
                    
                    // Calculate total allocated to this category across all paychecks
                    const totalAllocated = allocations.filter(a => a.categoryId === cat.id).reduce((sum, a) => sum + a.amount, 0);
                    const targetMet = totalAllocated >= cat.assigned && cat.assigned > 0;

                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-medium text-slate-800">
                          {cat.name}
                          {cat.dueDate && (
                            <span className="ml-2 text-xs font-normal bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                              Due: {cat.dueDate}{[1,21,31].includes(cat.dueDate) ? 'st' : [2,22].includes(cat.dueDate) ? 'nd' : [3,23].includes(cat.dueDate) ? 'rd' : 'th'}
                            </span>
                          )}
                          <div className="text-xs text-slate-400 font-normal mt-0.5">{cat.group}</div>
                        </td>
                        <td className="p-4 bg-slate-50 border-x border-slate-100 text-center">
                          <div className="font-bold text-slate-700">${cat.assigned.toLocaleString(undefined, { minimumFractionDigits: 0 })}</div>
                          {targetMet && <div className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">Goal Met</div>}
                        </td>
                        {currentPaychecks.map(check => {
                          const allocation = allocations.find(a => a.paycheckId === check.id && a.categoryId === cat.id)?.amount || '';
                          return (
                            <td key={`${check.id}-${cat.id}`} className="p-4">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                <input 
                                  type="number" 
                                  value={allocation}
                                  onChange={(e) => handleAllocationChange(check.id, cat.id, e.target.value)}
                                  className="w-full py-1.5 pl-6 pr-2 rounded bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                                  placeholder="0.00"
                                />
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {currentPaychecks.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  Add an expected paycheck above to start planning your allocations.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}