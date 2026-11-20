import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  ScanLine,
  Menu,
} from 'lucide-react';
import { useBusinessStore } from './hooks/useBusinessStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { PosView } from './components/PosView';
import { ProductsView } from './components/ProductsView';
import { InventoryView } from './components/InventoryView';
import { StockTransfersView } from './components/StockTransfersView';
import { BarcodeCentreView } from './components/BarcodeCentreView';
import { SmartScannerView } from './components/SmartScannerView';
import { StorefrontView } from './components/StorefrontView';
import { ContractorProjectsView } from './components/ContractorProjectsView';
import { DeliveriesView } from './components/DeliveriesView';
import { FinanceView } from './components/FinanceView';
import { ApprovalsView } from './components/ApprovalsView';
import { AuditTrailView } from './components/AuditTrailView';
import { LocationsView } from './components/LocationsView';
import { StaffManagementView } from './components/StaffManagementView';
import { DemoTourBanner } from './components/DemoTourBanner';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const {
    locations,
    staff,
    products,
    sales,
    onlineOrders,
    transfers,
    projects,
    quotations,
    expenses,
    approvals,
    auditLogs,
    cashRegister,
    vehicles,
    suppliers,
    currentUser,
    activeLocationId,
    activeTab,
    storefrontSettings,
    setActiveTab,
    switchUser,
    setViewingLocation,
    processPosSale,
    placeOnlineOrder,
    requestStockTransfer,
    approveStockTransfer,
    dispatchStockTransfer,
    receiveStockTransfer,
    resolveApproval,
    recordExpense,
    adjustStock,
    exportBackup,
    addProduct,
    updateProduct,
    deleteProduct,
    updatePrices,
    addLocation,
    updateLocation,
    deleteLocation,
    addStaff,
    updateStaff,
    deleteStaff,
    addProject,
    updateProject,
    deleteProject,
    addQuotation,
    updateStorefrontSettings,
    waybills,
    gatePasses,
    goodsReceivedNotes,
    recordGoodsReceivedNote,
    recordMidDayCashDrop,
    performBlindCloseout,
    recordContractorPayment,
  } = useBusinessStore();

  const [targetedProductId, setTargetedProductId] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;
  const inTransitTransfersCount = transfers.filter((t) => t.status === 'in_transit' || t.status === 'dispatched').length;

  const navigateToBarcode = (productId: string) => {
    setTargetedProductId(productId);
    setActiveTab('barcode');
  };

  const navigateToTransfer = (productId: string) => {
    setTargetedProductId(productId);
    setActiveTab('transfers');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 font-sans">
      {/* Top Bar Header Contract */}
      <Header
        currentUser={currentUser}
        staff={staff}
        activeLocationId={activeLocationId}
        locations={locations}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchUser={switchUser}
        onSwitchLocation={setViewingLocation}
        pendingApprovalsCount={pendingApprovalsCount}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />

      {/* Interactive Operational Demo Tour Banner */}
      <DemoTourBanner onNavigateTab={setActiveTab} />

      <div className="flex-1 flex overflow-hidden">
        {/* Internal Operations Sidebar (hidden in standalone Public Storefront mode if desired) */}
        {activeTab !== 'storefront' ? (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            pendingApprovalsCount={pendingApprovalsCount}
            inTransitTransfersCount={inTransitTransfersCount}
            onExportBackup={exportBackup}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />
        ) : null}

        {/* Main Content Viewport */}
        <main className={`flex-1 overflow-y-auto p-4 pb-24 md:pb-8 lg:p-8 ${activeTab === 'storefront' ? 'max-w-7xl mx-auto w-full' : ''}`}>
          {activeTab === 'dashboard' && (
            <DashboardView
              locations={locations}
              products={products}
              sales={sales}
              expenses={expenses}
              approvals={approvals}
              activeLocationId={activeLocationId}
              currentUser={currentUser}
              staff={staff}
              onNavigate={setActiveTab}
              onSelectLocation={setViewingLocation}
            />
          )}

          {activeTab === 'pos' && (
            <PosView
              products={products}
              currentUser={currentUser}
              activeLocationId={activeLocationId}
              locations={locations}
              projects={projects}
              onProcessSale={processPosSale}
              onAdjustStock={adjustStock}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              locations={locations}
              activeLocationId={activeLocationId}
              currentUser={currentUser}
              onNavigateToBarcode={navigateToBarcode}
              onNavigateToTransfer={navigateToTransfer}
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
              onUpdatePrices={updatePrices}
              onDeleteProduct={deleteProduct}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              locations={locations}
              activeLocationId={activeLocationId}
              currentUser={currentUser}
              onAdjustStock={adjustStock}
              onNavigateToTransfer={navigateToTransfer}
            />
          )}

          {activeTab === 'transfers' && (
            <StockTransfersView
              transfers={transfers}
              locations={locations}
              products={products}
              currentUser={currentUser}
              onRequestTransfer={requestStockTransfer}
              onApproveTransfer={approveStockTransfer}
              onDispatchTransfer={dispatchStockTransfer}
              onReceiveTransfer={receiveStockTransfer}
            />
          )}

          {activeTab === 'barcode' && (
            <BarcodeCentreView
              products={products}
              initialProductId={targetedProductId}
            />
          )}

          {activeTab === 'scanner' && (
            <SmartScannerView
              products={products}
              locations={locations}
              activeLocationId={activeLocationId}
              currentUser={currentUser}
              onNavigateToPos={() => setActiveTab('pos')}
              onNavigateToTransfer={navigateToTransfer}
            />
          )}

          {activeTab === 'storefront' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="text-xs text-slate-500">
                  Viewing Public E-Commerce Interface · Elite Energy Direct Storefront
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  Return to Backoffice ERP
                </button>
              </div>
              <StorefrontView
                products={products}
                locations={locations}
                onlineOrders={onlineOrders}
                storefrontSettings={storefrontSettings}
                currentUser={currentUser}
                onPlaceOnlineOrder={placeOnlineOrder}
                onUpdateStorefrontSettings={updateStorefrontSettings}
              />
            </div>
          )}

          {activeTab === 'projects' && (
            <ContractorProjectsView
              projects={projects}
              quotations={quotations}
              products={products}
              currentUser={currentUser}
              onAddProject={addProject}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              onAddQuotation={addQuotation}
              onRecordPayment={recordContractorPayment}
            />
          )}

          {activeTab === 'locations' && (
            <LocationsView
              locations={locations}
              staff={staff}
              products={products}
              currentUser={currentUser}
              onAddLocation={addLocation}
              onUpdateLocation={updateLocation}
              onDeleteLocation={deleteLocation}
              onSelectLocationForView={setViewingLocation}
            />
          )}

          {activeTab === 'staff' && (
            <StaffManagementView
              staff={staff}
              locations={locations}
              currentUser={currentUser}
              onAddStaff={addStaff}
              onUpdateStaff={updateStaff}
              onDeleteStaff={deleteStaff}
              onSwitchUser={switchUser}
            />
          )}

          {activeTab === 'deliveries' && (
            <DeliveriesView
              vehicles={vehicles}
              currentUser={currentUser}
              waybills={waybills}
              gatePasses={gatePasses}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceView
              sales={sales}
              expenses={expenses}
              cashRegister={cashRegister}
              currentUser={currentUser}
              locations={locations}
              activeLocationId={activeLocationId}
              products={products}
              suppliers={suppliers}
              goodsReceivedNotes={goodsReceivedNotes}
              onRecordExpense={recordExpense}
              onRecordDrop={recordMidDayCashDrop}
              onBlindCloseout={performBlindCloseout}
              onSubmitGrn={recordGoodsReceivedNote}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsView
              approvals={approvals}
              currentUser={currentUser}
              onResolveApproval={resolveApproval}
            />
          )}

          {activeTab === 'audit' && (
            <AuditTrailView
              auditLogs={auditLogs}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'purchasing' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Procurement & Supplier Directory</h2>
                  <p className="text-xs text-slate-500">Dangote Cement Plc, African Foundries, Nigerite, Coleman Wires</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500">
                      <th className="py-3 px-4">Supplier Entity</th>
                      <th className="py-3 px-3">Categories</th>
                      <th className="py-3 px-3">Contact & Phone</th>
                      <th className="py-3 px-3">Terms</th>
                      <th className="py-3 px-4 text-right font-mono">Outstanding Payable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {suppliers.map((sup) => (
                      <tr key={sup.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{sup.name}</div>
                          <div className="text-[11px] text-slate-400">{sup.address}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm font-medium">
                            {sup.categoriesSupplied.join(', ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-medium text-slate-900">{sup.contactPerson}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{sup.phone}</div>
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-600">{sup.paymentTerms}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-red-600 tabular-nums">
                          ₦{sup.outstandingBalance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (<md screens) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-1.5 px-2 text-slate-400 shadow-2xl"
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 rounded-lg transition ${
            activeTab === 'dashboard' ? 'text-sky-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('pos')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 rounded-lg transition ${
            activeTab === 'pos' ? 'text-sky-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">POS</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 rounded-lg transition ${
            activeTab === 'inventory' ? 'text-sky-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <Boxes className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Stock</span>
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 rounded-lg transition ${
            activeTab === 'scanner' ? 'text-sky-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <ScanLine className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Scanner</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 rounded-lg text-slate-400 hover:text-slate-200 transition"
          aria-label="Open full menu"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">More</span>
          {(pendingApprovalsCount > 0 || inTransitTransfersCount > 0) && (
            <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
          )}
        </button>
      </nav>

      {/* Offline Status Warning Banner */}
      <OfflineIndicator />
    </div>
  );
}
