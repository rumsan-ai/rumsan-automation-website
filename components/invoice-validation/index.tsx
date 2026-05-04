"use client";

import { Button } from "@/components/ui/button";
import { useClaimsPortal } from "@/hooks/use-claims-portal";
import { StepsSidebar, WarrantyExpiredDialog, WarrantyAvailableDialog, InvalidInvoiceDialog } from "./steps-sidebar";
import { StepStart, StepUpload } from "./step-upload";
import { StepProduct, StepIssue } from "./step-product";
import { StepResolution, SubmissionSuccess } from "./step-resolution";

export function ClaimsPortal() {
  const {
    claimData,
    setClaimData,
    isSubmitting,
    isSubmitted,
    redirectCountdown,
    currentStep,
    setCurrentStep,
    claimStarted,
    warrantyStatus,
    showWarrantyExpiredDialog,
    showWarrantyAvailableDialog,
    showInvalidInvoiceDialog,
    webhookProducts,
    fileInputRef,
    canGoBack,
    currentIssueOptions,
    currentResolutionOptions,
    handleStartClaim,
    handleFileUpload,
    handleProductToggle,
    handleIssueTypeChange,
    handleContinueToProducts,
    handleContinueToIssue,
    handleContinueToResolution,
    handleSubmitClaim,
    handleWarrantyAvailableDecision,
    handleWarrantyExpiredDecision,
    handleInvalidInvoiceDismiss,
  } = useClaimsPortal();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 max-w-5xl mx-auto">
      <div className="lg:col-span-1"></div>
      
      <div className="lg:col-span-4">
        <StepsSidebar
          claimData={claimData}
          warrantyStatus={warrantyStatus}
          claimStarted={claimStarted}
        />
      </div>

      <div className="lg:col-span-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="pt-2 pb-1.5 px-3 border-b border-slate-100">
            <h2 className="text-base font-semibold">Claim Support</h2>
            <p className="text-xs text-slate-500">Complete each step to submit your claim</p>
          </div>
          <div className="space-y-1.5 pb-2 pt-2 px-3">
            {!isSubmitted ? (
              <>
                {currentStep === 0 && (
                  <StepStart isSubmitting={isSubmitting} onStart={handleStartClaim} />
                )}

                {currentStep === 1 && (
                  <StepUpload
                    invoice={claimData.invoice}
                    isSubmitting={isSubmitting}
                    showAnyDialog={
                      showWarrantyExpiredDialog ||
                      showWarrantyAvailableDialog ||
                      showInvalidInvoiceDialog
                    }
                    fileInputRef={fileInputRef}
                    onFileChange={handleFileUpload}
                    onContinue={handleContinueToProducts}
                  />
                )}

                {showWarrantyExpiredDialog && (
                  <>
                    <div className="border-t border-slate-100 mt-3" />
                    <WarrantyExpiredDialog onDecision={handleWarrantyExpiredDecision} />
                  </>
                )}

                {showWarrantyAvailableDialog && (
                  <>
                    <div className="border-t border-slate-100 mt-3" />
                    <WarrantyAvailableDialog onDecision={handleWarrantyAvailableDecision} />
                  </>
                )}

                {showInvalidInvoiceDialog && (
                  <>
                    <div className="border-t border-slate-100 mt-3" />
                    <InvalidInvoiceDialog onDismiss={handleInvalidInvoiceDismiss} />
                  </>
                )}

                {currentStep === 2 && (
                  <StepProduct
                    selectedProducts={claimData.products}
                    selectedSupportType={claimData.supportType}
                    webhookProducts={webhookProducts}
                    isSubmitting={isSubmitting}
                    onProductToggle={handleProductToggle}
                    onSupportTypeChange={(supportType) =>
                      setClaimData((prev) => ({ ...prev, supportType }))
                    }
                    onContinue={handleContinueToIssue}
                  />
                )}

                {currentStep === 3 && (
                  <StepIssue
                    issueType={claimData.issueType}
                    issueDescription={claimData.issueDescription}
                    issueOptions={currentIssueOptions}
                    isSubmitting={isSubmitting}
                    onIssueTypeChange={handleIssueTypeChange}
                    onIssueDescriptionChange={(value) =>
                      setClaimData((prev) => ({ ...prev, issueDescription: value }))
                    }
                    onContinue={handleContinueToResolution}
                  />
                )}

                {currentStep === 4 && (
                  <StepResolution
                    selectedResolution={claimData.selectedResolution}
                    desiredResolution={claimData.desiredResolution}
                    notificationEmail={claimData.notificationEmail}
                    resolutionOptions={currentResolutionOptions}
                    isSubmitting={isSubmitting}
                    onResolutionChange={(value) =>
                      setClaimData((prev) => ({ ...prev, selectedResolution: value }))
                    }
                    onDesiredResolutionChange={(value) =>
                      setClaimData((prev) => ({ ...prev, desiredResolution: value }))
                    }
                    onEmailChange={(value) =>
                      setClaimData((prev) => ({ ...prev, notificationEmail: value }))
                    }
                    onSubmit={handleSubmitClaim}
                  />
                )}

                {currentStep > 0 && !isSubmitted && canGoBack && (
                  <div className="flex justify-start items-center p-1 bg-white rounded-lg border border-slate-200 mt-1.5">
                    <Button
                      onClick={() => setCurrentStep((s) => s - 1)}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1 text-xs"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Back
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <SubmissionSuccess
                notificationEmail={claimData.notificationEmail}
                redirectCountdown={redirectCountdown}
              />
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2"></div>
    </div>
  );
}
