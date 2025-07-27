import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle, Copy, Upload, X, DollarSign } from 'lucide-react';
import { Link } from 'wouter';
import { usePayment } from '@/hooks/usePayment';

type PaymentMethod = 'easypaisa' | 'jazzcash' | 'binance' | 'usdt';

interface PaymentDetails {
  binance: {
    qrCode: string;
    address: string;
    network: string;
  };
  easypaisa: {
    accountNumber: string;
    accountName: string;
  };
  jazzcash: {
    accountNumber: string;
    accountName: string;
  };
  usdt: {
    address: string;
    network: string;
  };
}

// Component to display payment instructions based on selected method
const PaymentInstructions: React.FC<{ method: PaymentMethod | null; details: PaymentDetails | null }> = ({ method, details }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!method || !details) {
    return <div className="text-muted-foreground">Select a payment method to view instructions</div>;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Address copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMethodDetails = () => {
    switch (method) {
      case 'binance':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Network</p>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <code className="text-sm">{details.binance.network}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(details.binance.network)}
                  className="h-8 px-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <code className="text-sm font-mono break-all pr-2">
                  {details.binance.address}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(details.binance.address)}
                  className="h-8 px-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {details.binance.qrCode && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">QR Code</p>
                <img
                  src={details.binance.qrCode}
                  alt="Binance QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
            )}
          </div>
        );

      case 'easypaisa':
      case 'jazzcash':
        const account = method === 'easypaisa' ? details.easypaisa : details.jazzcash;
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Account Number</p>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <code className="text-sm">{account.accountNumber}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(account.accountNumber)}
                  className="h-8 px-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Account Name</p>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">{account.accountName}</p>
              </div>
            </div>
          </div>
        );

      case 'usdt':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Network</p>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <code className="text-sm">{details.usdt.network}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(details.usdt.network)}
                  className="h-8 px-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <code className="text-sm font-mono break-all pr-2">
                  {details.usdt.address}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(details.usdt.address)}
                  className="h-8 px-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Payment Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Send the exact amount to the following {method === 'binance' || method === 'usdt' ? 'wallet' : 'account'}.
              Your deposit will be processed after confirmation.
            </p>
          </div>
          {renderMethodDetails()}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Deposit Form Component
const DepositForm: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createDeposit, uploadPaymentProof, paymentDetails, selectedMethod, setSelectedMethod, isLoading, txId, fetchPaymentDetails } = usePayment();

  // Form state
  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [showScreenshotUpload, setShowScreenshotUpload] = useState(false);

  // Fetch payment details on component mount
  const { data: paymentData, isLoading: isLoadingDetails } = useQuery<PaymentDetails>({
    queryKey: ['paymentDetails'],
    queryFn: fetchPaymentDetails,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle file selection for screenshot
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG or PNG image',
        variant: 'destructive',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(file);
      setShowScreenshotUpload(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setScreenshot(null);
    setShowScreenshotUpload(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle deposit submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMethod) {
      toast({
        title: 'Error',
        description: 'Please select a payment method',
        variant: 'destructive',
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createDeposit(amountValue, selectedMethod, referenceNumber);
      setShowScreenshotUpload(true);
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create deposit',
        variant: 'destructive',
      });
    }
  };

  // Handle payment proof upload
  const handleScreenshotUpload = async () => {
    if (!screenshot) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      await uploadPaymentProof(screenshot, referenceNumber);
      toast({
        title: 'Success',
        description: 'Payment proof uploaded successfully',
      });
      // Reset form
      setAmount('');
      setReferenceNumber('');
      setScreenshot(null);
      setShowScreenshotUpload(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload payment proof',
        variant: 'destructive',
      });
    }
  };

  // Render the appropriate form based on the current state
  const renderForm = () => {
    if (txId && selectedMethod) {
      // Show proof upload form
      return (
        <form onSubmit={handleScreenshotUpload} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Reference Number (Optional)</Label>
            <Input
              id="referenceNumber"
              type="text"
              placeholder="Enter reference/transaction ID"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Payment Proof</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="screenshot-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                {screenshot ? (
                  <div className="relative w-full h-full">
                    <img
                      src={URL.createObjectURL(screenshot)}
                      alt="Payment proof preview"
                      className="w-full h-full object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6">
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG (max. 5MB)
                    </p>
                  </div>
                )}
                <input
                  id="screenshot-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={!screenshot}>
              Upload Payment Proof
            </Button>
          </div>
        </form>
      );
    }

    // Show deposit form
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (PKR)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="1"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Tabs
            defaultValue="easypaisa"
            className="w-full"
            onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="easypaisa" disabled={isLoading}>
                Easypaisa
              </TabsTrigger>
              <TabsTrigger value="jazzcash" disabled={isLoading}>
                JazzCash
              </TabsTrigger>
              <TabsTrigger value="binance" disabled={isLoading}>
                Binance
              </TabsTrigger>
              <TabsTrigger value="usdt" disabled={isLoading}>
                USDT
              </TabsTrigger>
            </TabsList>

            {selectedMethod && paymentDetails && (
              <TabsContent value={selectedMethod}>
                <PaymentInstructions method={selectedMethod as PaymentMethod} details={paymentDetails} />
              </TabsContent>
            )}
          </Tabs>
        </div>

        <Button type="submit" className="w-full" disabled={!selectedMethod || !amount || isLoading}>
          {isLoading ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </form>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-2">Deposit Funds</h1>
        <p className="text-muted-foreground">Add funds to your account using any payment method</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {txId ? 'Upload Payment Proof' : 'Deposit Amount'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            renderForm()
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Main page component
export default function DepositPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        <h1 className="text-3xl font-bold mb-2 text-yellow-300 drop-shadow">Deposit Funds</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <DepositForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}