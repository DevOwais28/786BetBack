import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  QrCode, 
  Smartphone, 
  CreditCard,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/utils/api';

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
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  method: 'easypaisa' | 'jazzcash' | 'binance';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  accountDetails?: any;
}

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [selectedMethod, setSelectedMethod] = useState<'easypaisa' | 'jazzcash' | 'binance'>('binance');
  const [amount, setAmount] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payment details
  const { data: paymentDetails = {
    binance: { qrCode: '', address: '', network: '' },
    easypaisa: { accountNumber: '', accountName: '' },
    jazzcash: { accountNumber: '', accountName: '' }
  }, isLoading: loadingDetails } = useQuery<PaymentDetails>({
    queryKey: ['/api/deposit/payment-details'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user balance and transactions
  const { data: walletData = { data: { balance: 0, transactions: [] } } } = useQuery<any>({
    queryKey: ['/api/wallet'],
    staleTime: 30 * 1000,
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (depositData: any) => {
      const formData = new FormData();
      formData.append('amount', depositData.amount);
      formData.append('method', depositData.method);
      formData.append('screenshot', depositData.screenshot);
      
      // Use api.post for consistency
      const result = await api.post('/api/deposit', formData);
      return result.data;
    },
    onSuccess: () => {
      toast({
        title: '✅ Deposit Request Submitted',
        description: 'Your deposit will be processed within 1-2 hours',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      setAmount('');
      setScreenshot(null);
    },
    onError: () => {
      toast({
        title: '❌ Deposit Failed',
        description: 'Please try again or contact support',
        variant: 'destructive',
      });
    },
  });

  // Withdrawal mutation
  const withdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: any) => {
      // Use api.post for consistency
      const result = await api.post('/api/withdrawal', withdrawalData);
      return result.data;
    },
    onSuccess: () => {
      toast({
        title: '✅ Withdrawal Request Submitted',
        description: 'Your withdrawal will be processed within 2-4 hours',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      setAmount('');
      setAccountDetails('');
    },
    onError: () => {
      toast({
        title: '❌ Withdrawal Failed',
        description: 'Insufficient balance or invalid details',
        variant: 'destructive',
      });
    },
  });

  const handleDeposit = () => {
    if (!amount || +amount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    if (!screenshot && selectedMethod !== 'binance') {
      toast({ title: 'Please upload payment screenshot', variant: 'destructive' });
      return;
    }

    depositMutation.mutate({
      amount,
      method: selectedMethod,
      screenshot,
    });
  };

  const handleWithdrawal = () => {
    if (!amount || +amount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    if (!accountDetails) {
      toast({ title: 'Please enter account details', variant: 'destructive' });
      return;
    }

    withdrawalMutation.mutate({
      amount,
      method: selectedMethod,
      accountDetails,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
    toast({ title: 'Address copied!' });
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'binance': return <QrCode className="w-4 h-4" />;
      case 'easypaisa': return <Smartphone className="w-4 h-4" />;
      case 'jazzcash': return <CreditCard className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'binance': return 'Binance USDT';
      case 'easypaisa': return 'EasyPaisa';
      case 'jazzcash': return 'JazzCash';
      default: return method;
    }
  };

  // Only allow these payment methods
  const paymentMethods = ['binance', 'easypaisa', 'jazzcash'] as const;

  if (loadingDetails) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-yellow-300 drop-shadow">Wallet</h1>
          <p className="text-slate-400">Manage your deposits and withdrawals</p>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-yellow-400 via-yellow-600 to-orange-500 border-yellow-400 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-yellow-300 drop-shadow" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-400">
              ${walletData?.data?.balance?.toLocaleString() || '0.00'}
            </div>
            <p className="text-slate-400 mt-2">Available for withdrawal</p>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4" />
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Deposit Tab */}
          <TabsContent value="deposit">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Payment Method Selection */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Select Payment Method</CardTitle>
                  <CardDescription>Choose your preferred deposit method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method}
                      variant={selectedMethod === method ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedMethod(method as any)}
                    >
                      {getMethodIcon(method)}
                      <span className="ml-2">{getMethodName(method)}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Send payment to the following details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedMethod === 'binance' && (
                    <>
                      <div className="space-y-4">
                        <div>
                          <Label>USDT Address (TRC20)</Label>
                          <div className="flex items-center space-x-2 bg-slate-700 p-3 rounded-lg">
                            <span className="flex-1 font-mono text-sm">{paymentDetails?.binance.address}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(paymentDetails?.binance.address || '')}
                            >
                              {copiedAddress ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>QR Code</Label>
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${paymentDetails?.binance.address}`} 
                            alt="Binance QR" 
                            className="w-48 h-48 mx-auto rounded-lg"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedMethod === 'easypaisa' && (
                    <>
                      <div>
                        <Label>EasyPaisa Account</Label>
                        <div className="bg-slate-700 p-3 rounded-lg">
                          <p className="font-medium">{paymentDetails?.easypaisa.accountName}</p>
                          <p className="font-mono text-lg">{paymentDetails?.easypaisa.accountNumber}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedMethod === 'jazzcash' && (
                    <>
                      <div>
                        <Label>JazzCash Account</Label>
                        <div className="bg-slate-700 p-3 rounded-lg">
                          <p className="font-medium">{paymentDetails?.jazzcash.accountName}</p>
                          <p className="font-mono text-lg">{paymentDetails?.jazzcash.accountNumber}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Amount (USD)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  {selectedMethod !== 'binance' && (
                    <div>
                      <Label>Upload Payment Screenshot</Label>
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                          className="hidden"
                          id="screenshot-upload"
                        />
                        <label htmlFor="screenshot-upload" className="cursor-pointer">
                          <span className="text-blue-400 hover:text-blue-300">Click to upload</span>
                          <p className="text-sm text-slate-400 mt-1">
                            {screenshot ? screenshot.name : 'No file selected'}
                          </p>
                        </label>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 text-black font-bold shadow-lg hover:brightness-110 w-full" 
                    onClick={handleDeposit}
                    disabled={depositMutation.isPending}
                  >
                    {depositMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Deposit $${amount || '0'}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Withdraw Funds</CardTitle>
                  <CardDescription>Enter withdrawal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Withdrawal Method</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.map((method) => (
                        <Button
                          key={method}
                          variant={selectedMethod === method ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedMethod(method as any)}
                        >
                          {getMethodName(method)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Amount (USD)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div>
                    <Label>Account Details</Label>
                    <Input
                      type="text"
                      placeholder={
                        selectedMethod === 'binance' 
                          ? 'USDT TRC20 Address' 
                          : 'Account Number / Phone Number'
                      }
                      value={accountDetails}
                      onChange={(e) => setAccountDetails(e.target.value)}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <Alert className="bg-yellow-500/10 border-yellow-500/20">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      Withdrawals are processed within 2-4 hours during business hours
                    </AlertDescription>
                  </Alert>

                  <Button 
                    className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 text-black font-bold shadow-lg hover:brightness-110 w-full" 
                    onClick={handleWithdrawal}
                    disabled={withdrawalMutation.isPending}
                  >
                    {withdrawalMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Withdraw $${amount || '0'}`
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Withdrawal Limits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Minimum Withdrawal</span>
                      <span>$10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Maximum Withdrawal</span>
                      <span>$10,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Processing Time</span>
                      <span>2-4 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fee</span>
                      <span className="text-green-400">0%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Recent deposits and withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletData?.data?.transactions?.map((tx: Transaction) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          tx.type === 'deposit' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {tx.type === 'deposit' ? <ArrowDownCircle /> : <ArrowUpCircle />}
                        </div>
                        <div>
                          <p className="font-medium">
                            {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} - {getMethodName(tx.method)}
                          </p>
                          <p className="text-sm text-slate-400">
                            {new Date(tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${tx.amount.toLocaleString()}
                        </p>
                        <Badge 
                          variant={tx.status === 'approved' ? 'default' : 'secondary'}
                          className={
                            tx.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                            tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
