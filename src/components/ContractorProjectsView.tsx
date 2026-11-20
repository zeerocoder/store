import React, { useState } from 'react';
import {
  HardHat,
  Plus,
  Building,
  CreditCard,
  FileText,
  Phone,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  User,
  Calculator,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';
import { ContractorProject, Quotation, StaffUser, Product } from '../types';

interface ContractorProjectsViewProps {
  projects: ContractorProject[];
  quotations: Quotation[];
  products: Product[];
  currentUser: StaffUser;
  onAddProject?: (project: Omit<ContractorProject, 'id' | 'outstandingBalance' | 'totalPurchased'>) => ContractorProject;
  onUpdateProject?: (id: string, updates: Partial<ContractorProject>) => void;
  onDeleteProject?: (id: string) => void;
  onAddQuotation?: (quote: Omit<Quotation, 'id' | 'createdAt'>) => Quotation;
  onRecordPayment?: (projectId: string, amount: number, paymentRef: string) => void;
}

export const ContractorProjectsView: React.FC<ContractorProjectsViewProps> = ({
  projects,
  quotations,
  products,
  currentUser,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddQuotation,
  onRecordPayment,
}) => {
  const [selectedProject, setSelectedProject] = useState<ContractorProject | null>(projects[0] || null);
  const [mobileTab, setMobileTab] = useState<'projects' | 'dossier'>('projects');

  // Modals state
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ContractorProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<ContractorProject | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showEstimatorModal, setShowEstimatorModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState<number>(500000);
  const [settlementRef, setSettlementRef] = useState<string>('ZENITH-NIP-99214');

  // Add Project Form State
  const [projectName, setProjectName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [contactPhone, setContactPhone] = useState('+234 ');
  const [creditLimit, setCreditLimit] = useState<number>(10000000);
  const [assignedSalesRep, setAssignedSalesRep] = useState(currentUser.name);
  const [notes, setNotes] = useState('');

  // Estimator State
  const [estimatorTab, setEstimatorTab] = useState<'concrete' | 'blockwork' | 'tiles' | 'roofing'>('concrete');
  // Concrete inputs
  const [slabLength, setSlabLength] = useState(15);
  const [slabWidth, setSlabWidth] = useState(10);
  const [slabThickness, setSlabThickness] = useState(0.15); // 150mm
  // Blockwork inputs
  const [wallLength, setWallLength] = useState(40);
  const [wallHeight, setWallHeight] = useState(3.0);
  const [blockType, setBlockType] = useState<'9_inch' | '6_inch'>('9_inch');
  // Tiles inputs
  const [floorArea, setFloorArea] = useState(120);
  const [tileSize, setTileSize] = useState<'60x60' | '40x40'>('60x60');
  // Roofing inputs
  const [roofArea, setRoofArea] = useState(250);

  // New Quote Form State
  const [quoteItems, setQuoteItems] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [quoteValidDays, setQuoteValidDays] = useState(14);

  const canManageProjects = ['owner', 'general_manager', 'branch_manager', 'sales_rep'].includes(currentUser.role);

  // Calculations for Estimator
  const concreteEstimates = (() => {
    const volumeM3 = slabLength * slabWidth * slabThickness;
    // Standard 1:2:4 mix per m3: ~6.5 bags cement, 0.45 m3 sand (~0.7 tons), 0.9 m3 granite (~1.4 tons)
    const cementBags = Math.ceil(volumeM3 * 7.0);
    const sandTonnes = Math.ceil(volumeM3 * 0.75);
    const graniteTonnes = Math.ceil(volumeM3 * 1.5);
    const estimatedCost = cementBags * 10500 + (sandTonnes / 20) * 120000 + (graniteTonnes / 20) * 280000;
    return { volumeM3: volumeM3.toFixed(2), cementBags, sandTonnes, graniteTonnes, estimatedCost };
  })();

  const blockworkEstimates = (() => {
    const areaM2 = wallLength * wallHeight;
    // Standard block = 450mm x 225mm => approx 10 blocks per m2 with mortar joints
    const blocksCount = Math.ceil(areaM2 * (blockType === '9_inch' ? 10.5 : 10.0));
    // Approx 1 bag of cement lays 50 blocks
    const cementBags = Math.ceil(blocksCount / 50);
    const sandTrips = Number((blocksCount / 1000).toFixed(1));
    const estimatedCost = blocksCount * (blockType === '9_inch' ? 650 : 550) + cementBags * 10500;
    return { areaM2: areaM2.toFixed(1), blocksCount, cementBags, sandTrips, estimatedCost };
  })();

  const tileEstimates = (() => {
    const areaWithWastage = floorArea * 1.1; // 10% wastage allowance
    // 60x60cm carton covers 1.44m2 (4 pcs). 40x40cm carton covers 1.6m2 (10 pcs).
    const sqmPerCarton = tileSize === '60x60' ? 1.44 : 1.6;
    const cartons = Math.ceil(areaWithWastage / sqmPerCarton);
    const tileCementBags = Math.ceil(floorArea / 5); // 1 bag of gum per 5m2
    const estimatedCost = cartons * 11500 + tileCementBags * 3500;
    return { floorArea, cartons, tileCementBags, estimatedCost };
  })();

  const roofingEstimates = (() => {
    // 0.55mm aluminium longspan sheet width ~ 1.0m coverage
    const sheetsCount = Math.ceil(roofArea * 1.15 / 6.0); // assuming avg 6m length sheets
    const estimatedCost = sheetsCount * 28000;
    return { roofArea, sheetsCount, estimatedCost };
  })();

  const handleOpenAdd = () => {
    setProjectName('');
    setCompanyName('');
    setSiteLocation('');
    setContractorName('');
    setContactPhone('+234 ');
    setCreditLimit(15000000);
    setAssignedSalesRep(currentUser.name);
    setNotes('Approved institutional 30-day corporate credit terms.');
    setShowAddProjectModal(true);
  };

  const handleSaveAdd = () => {
    if (!projectName || !companyName || !contractorName) {
      alert('Please fill in the Project Name, Company Name, and Contractor Lead.');
      return;
    }
    if (onAddProject) {
      const newProj = onAddProject({
        projectName,
        companyName,
        siteLocation: siteLocation || 'Lagos State Project Site',
        contractorName,
        contactPhone,
        creditLimit: Number(creditLimit) || 5000000,
        assignedSalesRep,
        status: 'active',
        notes,
      });
      setSelectedProject(newProj);
    }
    setShowAddProjectModal(false);
  };

  const handleOpenEdit = (proj: ContractorProject) => {
    setEditingProject(proj);
    setProjectName(proj.projectName);
    setCompanyName(proj.companyName);
    setSiteLocation(proj.siteLocation);
    setContractorName(proj.contractorName);
    setContactPhone(proj.contactPhone);
    setCreditLimit(proj.creditLimit);
    setNotes(proj.notes || '');
  };

  const handleSaveEdit = () => {
    if (!editingProject) return;
    if (onUpdateProject) {
      onUpdateProject(editingProject.id, {
        projectName,
        companyName,
        siteLocation,
        contractorName,
        contactPhone,
        creditLimit: Number(creditLimit),
        notes,
      });
    }
    setEditingProject(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingProject) return;
    if (onDeleteProject) {
      onDeleteProject(deletingProject.id);
    }
    if (selectedProject?.id === deletingProject.id) {
      setSelectedProject(projects.find((p) => p.id !== deletingProject.id) || null);
    }
    setDeletingProject(null);
  };

  const handleCreateQuotation = () => {
    if (!selectedProject) return;
    if (quoteItems.length === 0) {
      alert('Please add at least one material line item to the quotation.');
      return;
    }

    const items = quoteItems.map((qi) => ({
      productId: qi.product.id,
      productName: qi.product.name,
      quantity: qi.quantity,
      unit: qi.product.baseUnit,
      unitPrice: qi.product.contractorPrice,
      subtotal: qi.quantity * qi.product.contractorPrice,
    }));

    const totalAmount = items.reduce((sum, it) => sum + it.subtotal, 0);
    const validUntilDate = new Date(Date.now() + quoteValidDays * 86400000).toISOString().split('T')[0];

    if (onAddQuotation) {
      onAddQuotation({
        quoteNumber: `EET-QTE-${Math.floor(10000 + Math.random() * 90000)}`,
        contractorProjectId: selectedProject.id,
        clientName: selectedProject.companyName,
        projectName: selectedProject.projectName,
        clientPhone: selectedProject.contactPhone,
        items,
        totalAmount,
        status: 'approved',
        validUntil: validUntilDate,
        preparedBy: currentUser.name,
      });
    }

    setShowQuoteModal(false);
    setQuoteItems([]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <HardHat className="w-3.5 h-3.5 text-sky-600" />
            <span>Contractor & Project Purchasing</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Institutional Accounts, Site Projects & Structured Credit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track multi-stage construction site budgets, approved proforma quotations, construction material estimates, and 30-day corporate credit balances.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowEstimatorModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <Calculator className="w-3.5 h-3.5 text-sky-600" />
            <span>Material Estimator</span>
          </button>

          {canManageProjects && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Contractor Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Segmented Switcher (<lg) */}
      <div className="lg:hidden flex bg-slate-200/80 p-1 rounded-xl gap-1">
        <button
          onClick={() => setMobileTab('projects')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-lg transition min-h-[44px] ${
            mobileTab === 'projects'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active Site Projects ({projects.length})
        </button>
        <button
          onClick={() => setMobileTab('dossier')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-lg transition min-h-[44px] ${
            mobileTab === 'dossier'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Project Dossier {selectedProject ? `(${selectedProject.projectName.split(' ')[0]})` : ''}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Contractor Project Accounts */}
        <div className={`${mobileTab === 'projects' ? 'block' : 'hidden'} lg:block lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Active Site Projects ({projects.length})</h3>
            <span className="text-xs font-mono text-slate-500">Corporate Ledgers</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {projects.map((proj) => {
              const isSelected = selectedProject?.id === proj.id;
              const creditRatio = (proj.outstandingBalance / proj.creditLimit) * 100;

              return (
                <div
                  key={proj.id}
                  className={`w-full p-4 transition flex flex-col gap-2 cursor-pointer ${
                    isSelected ? 'bg-sky-50/70 border-l-4 border-l-sky-600' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    setSelectedProject(proj);
                    setMobileTab('dossier');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {proj.companyName}
                      </span>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {proj.projectName}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 capitalize">
                        {proj.status}
                      </span>
                      {canManageProjects && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(proj);
                          }}
                          className="p-1 text-slate-400 hover:text-sky-600 rounded-md"
                          title="Edit Project"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate">
                    📍 {proj.siteLocation} · Lead: <strong>{proj.contractorName}</strong>
                  </div>

                  {/* Credit Bar */}
                  <div className="mt-1 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400">Balance: </span>
                      <span className="font-bold text-red-600">₦{proj.outstandingBalance.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Limit: </span>
                      <span className="font-bold text-slate-800">₦{proj.creditLimit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Project Overview & Material Quotations */}
        <div className={`${mobileTab === 'dossier' ? 'block' : 'hidden'} lg:block lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 flex flex-col justify-between`}>
          {selectedProject ? (
            <div className="space-y-6">
              {/* Back to Projects Button for Mobile */}
              <button
                onClick={() => setMobileTab('projects')}
                className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-2 rounded-lg border border-sky-200 min-h-[44px]"
              >
                ← Back to All Projects
              </button>

              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                    Project Dossier · {selectedProject.companyName}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedProject.projectName}</h2>
                  <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-4">
                    <span>Site: <strong className="text-slate-800">{selectedProject.siteLocation}</strong></span>
                    <span>Lead: <strong>{selectedProject.contractorName}</strong></span>
                    <span>Contact: <strong className="font-mono">{selectedProject.contactPhone}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setQuoteItems(products.slice(0, 3).map((p) => ({ product: p, quantity: 50 })));
                      setShowQuoteModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Issue Formal Quotation</span>
                  </button>

                  {canManageProjects && projects.length > 1 && (
                    <button
                      onClick={() => setDeletingProject(selectedProject)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Archive Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Financial Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 text-xs p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Total Material Purchases</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
                    ₦{selectedProject.totalPurchased.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Outstanding Credit Balance</span>
                  <div className="text-base font-bold font-mono text-red-600 mt-0.5 tabular-nums">
                    ₦{selectedProject.outstandingBalance.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Remaining Available Credit</span>
                  <div className="text-base font-bold font-mono text-emerald-700 mt-0.5 tabular-nums">
                    ₦{(selectedProject.creditLimit - selectedProject.outstandingBalance).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 30 / 60 / 90 Days Debt Aging Ledger */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase">
                      Contractor Debt Aging Schedule (Days Overdue)
                    </span>
                    {selectedProject.agingSummary?.isCreditLocked ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white flex items-center gap-1">
                        <Lock className="w-3 h-3" /> POS CREDIT FROZEN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        CREDIT HEALTHY
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSettlementAmount(Math.min(selectedProject.outstandingBalance, 1000000) || 500000);
                      setShowSettlementModal(true);
                    }}
                    disabled={selectedProject.outstandingBalance <= 0}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white transition flex items-center gap-1.5 shadow-xs"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Record Debt Inflow</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[10px] uppercase text-slate-500 font-bold">0 - 30 Days (Current)</div>
                    <div className="font-mono font-bold text-slate-900 mt-1">
                      ₦{(selectedProject.agingSummary?.current || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-200">
                    <div className="text-[10px] uppercase text-blue-900 font-bold">31 - 60 Days</div>
                    <div className="font-mono font-bold text-blue-950 mt-1">
                      ₦{(selectedProject.agingSummary?.days30To60 || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-[10px] uppercase text-amber-900 font-bold">61 - 90 Days</div>
                    <div className="font-mono font-bold text-amber-950 mt-1">
                      ₦{(selectedProject.agingSummary?.days61To90 || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-[10px] uppercase text-red-900 font-bold">Over 90 Days (Overdue)</div>
                    <div className="font-mono font-bold text-red-700 mt-1">
                      ₦{(selectedProject.agingSummary?.over90Days || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Material Quotations Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase">Project Formal Quotations & Estimates</h4>
                  <span className="text-[11px] text-slate-400 font-mono">Contractor Pricing Applied</span>
                </div>

                <div className="space-y-2">
                  {quotations
                    .filter((q) => !q.contractorProjectId || q.contractorProjectId === selectedProject.id)
                    .map((qt) => (
                      <div key={qt.id} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs hover:border-slate-300 transition">
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-sky-600" />
                            <span>{qt.quoteNumber}</span>
                            <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-300">
                              {qt.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {qt.items.length} line items · Valid until {qt.validUntil}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                            ₦{qt.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">Prep by: {qt.preparedBy}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Notes */}
              <div className="p-3.5 rounded-xl bg-slate-50 text-slate-600 text-xs border border-slate-200">
                <strong>Project Account Memo:</strong> {selectedProject.notes || 'Strict 30-day corporate settlement terms agreed.'}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a contractor project to view account details and quotation history.
            </div>
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-sky-400" />
                  <span>Open Contractor Project Dossier</span>
                </h3>
                <p className="text-[11px] text-slate-400">Sets up contractor account credit limit, site location, and sales rep.</p>
              </div>
              <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Project Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dangote Refinery Housing Estate"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Contractor / Company Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Julius Berger Nigeria Plc"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Site Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Plot 10 Marina Coastal Road, Lekki Phase 1"
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Contractor Lead Engineer *</label>
                  <input
                    type="text"
                    placeholder="e.g. Engr. Kingsley Okon"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+234 803 000 0000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Approved Credit Limit (₦)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Assigned Sales Representative</label>
                  <input
                    type="text"
                    value={assignedSalesRep}
                    onChange={(e) => setAssignedSalesRep(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Account Memo & Delivery Terms</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button onClick={() => setShowAddProjectModal(false)} className="px-4 py-2 font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleSaveAdd}
                className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs"
              >
                Create Project Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Edit Project: {editingProject.projectName}</h3>
              <button onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Site Location</label>
                <input
                  type="text"
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Lead Engineer</label>
                  <input
                    type="text"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Credit Limit (₦)</label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Notes & Delivery Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button onClick={() => setEditingProject(null)} className="px-4 py-2 font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-300 p-5 space-y-4 text-slate-900">
            <h3 className="text-sm font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Archive Contractor Project</span>
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to archive <strong>{deletingProject.projectName}</strong>? Historical transaction and quotation records will remain safely preserved in the ledger.
            </p>
            <div className="flex items-center justify-end gap-2 text-xs">
              <button onClick={() => setDeletingProject(null)} className="px-3 py-1.5 font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Estimator Modal */}
      {showEstimatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-sky-400" />
                  <span>Construction Material Estimator</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Engineering material approximations for Nigerian building projects. Includes waste margins.
                </p>
              </div>
              <button onClick={() => setShowEstimatorModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Estimator Category Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setEstimatorTab('concrete')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    estimatorTab === 'concrete' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Concrete Slab / Column (1:2:4)
                </button>
                <button
                  onClick={() => setEstimatorTab('blockwork')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    estimatorTab === 'blockwork' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Blockwork & Masonry
                </button>
                <button
                  onClick={() => setEstimatorTab('tiles')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    estimatorTab === 'tiles' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Floor & Wall Tiling
                </button>
                <button
                  onClick={() => setEstimatorTab('roofing')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    estimatorTab === 'roofing' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Aluminium Roofing
                </button>
              </div>

              {/* Concrete Tab */}
              {estimatorTab === 'concrete' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[10px]">Length (Metres)</label>
                      <input
                        type="number"
                        value={slabLength}
                        onChange={(e) => setSlabLength(parseFloat(e.target.value) || 0)}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[10px]">Width (Metres)</label>
                      <input
                        type="number"
                        value={slabWidth}
                        onChange={(e) => setSlabWidth(parseFloat(e.target.value) || 0)}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[10px]">Thickness (Metres)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={slabThickness}
                        onChange={(e) => setSlabThickness(parseFloat(e.target.value) || 0.15)}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                      />
                      <span className="text-[10px] text-slate-400">0.15m = 150mm slab</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-700 uppercase">
                      Estimated Bill of Quantities (Vol: {concreteEstimates.volumeM3} m³)
                    </span>
                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Cement Grade 42.5R</span>
                        <div className="text-base font-bold font-mono text-slate-900 mt-1">
                          {concreteEstimates.cementBags} Bags
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Sharp River Sand</span>
                        <div className="text-base font-bold font-mono text-slate-900 mt-1">
                          {concreteEstimates.sandTonnes} Tonnes
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Quarry Granite 3/4"</span>
                        <div className="text-base font-bold font-mono text-slate-900 mt-1">
                          {concreteEstimates.graniteTonnes} Tonnes
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs pt-2 font-mono">
                      Estimated Material Cost: <strong className="text-sky-700 text-sm">₦{concreteEstimates.estimatedCost.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Blockwork Tab */}
              {estimatorTab === 'blockwork' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[10px]">Total Wall Length (m)</label>
                      <input
                        type="number"
                        value={wallLength}
                        onChange={(e) => setWallLength(parseFloat(e.target.value) || 0)}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[10px]">Wall Height (m)</label>
                      <input
                        type="number"
                        value={wallHeight}
                        onChange={(e) => setWallHeight(parseFloat(e.target.value) || 0)}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[10px]">Block Dimension</label>
                      <select
                        value={blockType}
                        onChange={(e) => setBlockType(e.target.value as '9_inch' | '6_inch')}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                      >
                        <option value="9_inch">9" Solid / Hollow Block</option>
                        <option value="6_inch">6" Solid / Hollow Block</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-700 uppercase">
                      Masonry Estimate ({blockworkEstimates.areaM2} m² Wall Area)
                    </span>
                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Vibrated Sandcrete Blocks</span>
                        <div className="text-base font-bold font-mono text-slate-900 mt-1">
                          {blockworkEstimates.blocksCount.toLocaleString()} Pcs
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Cement for Mortar Joint</span>
                        <div className="text-base font-bold font-mono text-slate-900 mt-1">
                          {blockworkEstimates.cementBags} Bags
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Plaster Sand</span>
                        <div className="text-base font-bold font-mono text-slate-900 mt-1">
                          {blockworkEstimates.sandTrips} 20T Trips
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs pt-2 font-mono">
                      Estimated Masonry Cost: <strong className="text-sky-700 text-sm">₦{blockworkEstimates.estimatedCost.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tiling Tab */}
              {estimatorTab === 'tiles' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[10px]">Floor Area (m²)</label>
                      <input
                        type="number"
                        value={floorArea}
                        onChange={(e) => setFloorArea(parseFloat(e.target.value) || 0)}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[10px]">Tile Size Format</label>
                      <select
                        value={tileSize}
                        onChange={(e) => setTileSize(e.target.value as '60x60' | '40x40')}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                      >
                        <option value="60x60">60cm x 60cm Glazed Porcelain (1.44 m²/box)</option>
                        <option value="40x40">40cm x 40cm Ceramic Floor (1.60 m²/box)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-700 uppercase">
                      Tiling Requirements (+10% Wastage Allowance)
                    </span>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Porcelain Tile Cartons</span>
                        <div className="text-base font-bold font-mono text-slate-900 mt-1">
                          {tileEstimates.cartons} Cartons
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Tile Adhesive Gum (20kg)</span>
                        <div className="text-base font-bold font-mono text-slate-900 mt-1">
                          {tileEstimates.tileCementBags} Bags
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs pt-2 font-mono">
                      Estimated Tiling Cost: <strong className="text-sky-700 text-sm">₦{tileEstimates.estimatedCost.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Roofing Tab */}
              {estimatorTab === 'roofing' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-slate-700 uppercase text-[10px]">Roof Plan Area (m²)</label>
                    <input
                      type="number"
                      value={roofArea}
                      onChange={(e) => setRoofArea(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-700 uppercase">
                      Aluminium Roofing Bill
                    </span>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">0.55mm Longspan Aluminium Sheets</span>
                      <div className="text-base font-bold font-mono text-slate-900 mt-1">
                        ~{roofingEstimates.sheetsCount} Lengths (Custom Profile)
                      </div>
                    </div>
                    <div className="text-right text-xs pt-2 font-mono">
                      Estimated Roofing Material Cost: <strong className="text-sky-700 text-sm">₦{roofingEstimates.estimatedCost.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 italic text-[11px]">
                Indicative civil engineering estimates for contractor budgeting.
              </span>
              <button
                onClick={() => setShowEstimatorModal(false)}
                className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
              >
                Close Calculator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Formal Quotation Modal */}
      {showQuoteModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                  <span>Issue Formal Contractor Quotation</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Client: {selectedProject.companyName} · {selectedProject.projectName}
                </p>
              </div>
              <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase text-[10px]">Quoted Product Lines:</span>
                {quoteItems.map((qi, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{qi.product.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Tier Price: ₦{qi.product.contractorPrice.toLocaleString()} / {qi.product.baseUnit}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-slate-500 font-bold">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={qi.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 1;
                          setQuoteItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, quantity: val } : it))
                          );
                        }}
                        className="w-20 p-1 rounded-md border border-slate-300 bg-white font-mono text-center font-bold"
                      />
                    </div>

                    <div className="text-right font-mono font-bold text-slate-900">
                      ₦{(qi.quantity * qi.product.contractorPrice).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between font-bold text-sm text-sky-900">
                <span>Total Quotation Sum:</span>
                <span className="font-mono text-base">
                  ₦{quoteItems.reduce((acc, it) => acc + it.quantity * it.product.contractorPrice, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button onClick={() => setShowQuoteModal(false)} className="px-4 py-2 font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleCreateQuotation}
                className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs"
              >
                Generate Proforma Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debt Settlement Inflow Modal */}
      {showSettlementModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Record Contractor Debt Settlement</h3>
              </div>
              <button onClick={() => setShowSettlementModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onRecordPayment && settlementAmount > 0) {
                  onRecordPayment(selectedProject.id, settlementAmount, settlementRef);
                  setSelectedProject((prev) =>
                    prev
                      ? {
                          ...prev,
                          outstandingBalance: Math.max(0, prev.outstandingBalance - settlementAmount),
                        }
                      : null
                  );
                }
                setShowSettlementModal(false);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contractor Entity</span>
                <span className="font-bold text-sm text-slate-900">{selectedProject.companyName}</span>
                <p className="text-[11px] text-slate-500">Project: {selectedProject.projectName}</p>
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex justify-between items-center font-mono">
                <span className="text-red-900 font-bold">Current Debt Balance:</span>
                <span className="text-sm font-black text-red-600">₦{selectedProject.outstandingBalance.toLocaleString()}</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Settlement Amount Received (₦)
                </label>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  max={selectedProject.outstandingBalance}
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(Number(e.target.value))}
                  className="w-full p-2.5 font-mono font-bold text-sm rounded-xl border border-slate-300 bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Bank Settlement Reference / Deposit Narration
                </label>
                <input
                  type="text"
                  value={settlementRef}
                  onChange={(e) => setSettlementRef(e.target.value)}
                  placeholder="e.g. GTB-NIP-6712399-TRANSFER"
                  className="w-full p-2 text-xs font-mono rounded-lg border border-slate-300 bg-white"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-900 text-[11px] border border-emerald-200">
                Payment will be automatically credited to the oldest overdue invoices first (90+ days ➔ 60 days ➔ current). If balance drops below credit ceiling, POS credit lock will lift immediately.
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSettlementModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md"
                >
                  Confirm Settlement & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
