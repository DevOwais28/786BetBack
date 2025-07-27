import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, DollarSign, Clock, AlertCircle, QrCode } from "lucide-react";
import { Link } from "wouter";
import { api } from '@/utils/api';


export default function Withdraw() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [showScreenshotUpload, setShowScreenshotUpload] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [withdrawalProof, setWithdrawalProof] = useState<string>("");
  const [showQrWithdraw, setShowQrWithdraw] = useState(false);

  const { data: userProfile } = useQuery<{
    balance: number;
  }>({
    queryKey: ["/api/user/profile"],
  });

  const { data: withdrawalHistory = [] } = useQuery<any[]>({
    queryKey: ["/api/user/withdrawals"],
  });

  const handleScreenshotUpload = async () => {
    if (!screenshotFile) {
      toast({
        title: "No file selected",
        description: "Please select a screenshot to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingScreenshot(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', screenshotFile);
      formData.append('amount', amount);
      formData.append('method', method);
      formData.append('accountDetails', accountDetails);

      await api.post('/api/upload-withdrawal-screenshot', formData);

      toast({
        title: "Withdrawal proof uploaded!",
        description: "Your withdrawal request will be processed shortly",
      });

      setScreenshotFile(null);
      setScreenshotPreview(null);
      setShowScreenshotUpload(false);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload screenshot",
        variant: "destructive",
      });
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string; accountDetails: string; proof?: string }) => {
      const response = await apiRequest("POST", "/api/user/withdraw", {
        ...data,
        proof: withdrawalProof || undefined
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (method === 'manual') {
        setShowScreenshotUpload(true);
        toast({
          title: "Upload required",
          description: "Please upload proof for manual withdrawal",
        });
      } else {
        toast({
          title: "Withdrawal requested",
          description: "Your withdrawal request has been submitted for review",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/withdrawals"] });
        setAmount("");
        setMethod("");
        setAccountDetails("");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (amountNum > (userProfile?.balance || 0)) {
      toast({
        title: "Insufficient balance",
        description: `Your current balance is $${userProfile?.balance?.toFixed(2) || '0.00'}`,
        variant: "destructive",
      });
      return;
    }

    if (!method) {
      toast({
        title: "Method required",
        description: "Please select a withdrawal method",
        variant: "destructive",
      });
      return;
    }

    if (method === 'crypto' && !accountDetails) {
      // This will be handled by the QR modal
      setShowQrWithdraw(true);
      return;
    }

    if (!accountDetails) {
      toast({
        title: "Account details required",
        description: `Please enter your ${method} details`,
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      amount: amountNum,
      method,
      accountDetails,
    });
  };

  const handleCryptoWithdraw = async (amount: number, address: string) => {
    withdrawMutation.mutate({
      amount,
      method: 'crypto',
      accountDetails: address,
    });
  };

  const quickAmounts = [50, 100, 250, 500];
  const maxWithdraw = Math.floor(userProfile?.balance || 0);
  // Only allow these payment methods
  const paymentMethods = [
    { value: 'binance', label: 'Binance (USDT)' },
    { value: 'easypaisa', label: 'EasyPaisa' },
    { value: 'jazzcash', label: 'JazzCash' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-600 to-orange-500 border-yellow-400 shadow-xl rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-yellow-300 drop-shadow">Withdraw Funds</h1>
              <p className="text-gray-400">Request a withdrawal from your casino account</p>
              <div className="mt-4 p-4 bg-gray-700 rounded-xl">
                <div className="text-sm text-gray-400 mb-1">Available Balance</div>
                <div className="text-2xl font-bold text-emerald">
                  ${userProfile?.balance || "0.00"}
                </div>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-6">
              {/* Amount Selection */}
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-3">
                  Withdrawal Amount (USD)
                </Label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant="outline"
                      disabled={quickAmount > maxWithdraw}
                      onClick={() => setAmount(quickAmount.toString())}
                      className={`bg-gray-700 hover:bg-emerald hover:text-white transition-all duration-300 ${
                        amount === quickAmount.toString() ? "bg-emerald text-white" : ""
                      }`}
                    >
                      ${quickAmount}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent transition-all duration-300"
                  placeholder="Enter amount"
                  min="10"
                  max={maxWithdraw}
                  step="0.01"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">
                  Minimum: $10 | Maximum: ${maxWithdraw}
                </p>
              </div>

              {/* Withdrawal Method */}
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-3">
                  Withdrawal Method
                </Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select withdrawal method" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {paymentMethods.map((paymentMethod) => (
                      <SelectItem key={paymentMethod.value} value={paymentMethod.value}>
                        {paymentMethod.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Account Details */}
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-3">
                  Account Details
                </Label>
                <textarea
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent transition-all duration-300 resize-none"
                  placeholder={
                    method === "binance" ? "Wallet Address" :
                    method === "easypaisa" ? "Mobile Number" :
                    method === "jazzcash" ? "Mobile Number" :
                    "Enter your account details"
                  }
                  rows={3}
                  required
                />
              </div>

              {/* Processing Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-blue-400 mb-3">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Processing Time</span>
                </div>
                <p className="text-sm text-gray-300 mt-2">
                  Withdrawals are typically processed within 24-48 hours after approval.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={withdrawMutation.isPending || !amount || !method || !accountDetails}
                className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 text-black font-bold shadow-lg hover:brightness-110 w-full rounded-2xl"
              >
                {withdrawMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-spinner w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Withdraw $${amount || "0"}`
                )}
              </Button>
            </form>
          </div>

          {/* Withdrawal History */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-6">Withdrawal History</h2>
            
            {withdrawalHistory.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-yellow-300 drop-shadow mx-auto mb-4" />
                <p className="text-gray-400">No withdrawals yet</p>
                <p className="text-sm text-gray-500">Your withdrawal history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawalHistory.map((withdrawal: any, index: number) => (
                  <div key={index} className="bg-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">${withdrawal.amount}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        withdrawal.status === "approved" ? "bg-emerald/20 text-emerald" :
                        withdrawal.status === "rejected" ? "bg-red-500/20 text-red-500" :
                        "bg-yellow-500/20 text-yellow-500"
                      }`}>
                        {withdrawal.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <div>Method: {withdrawal.method}</div>
                      <div>Requested: {withdrawal.timeAgo}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 text-yellow-400 mb-3">
            <AlertCircle className="w-6 h-6" />
            <span className="font-medium text-lg">Important Notice</span>
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• All withdrawals are subject to verification and approval</li>
            <li>• Minimum withdrawal amount is $10</li>
            <li>• Processing time: 24-48 hours after approval</li>
            <li>• Ensure your account details are correct to avoid delays</li>
            <li>• Contact support if you have any questions</li>
          </ul>
        </div>
      </div>

      {/* QR Withdraw Modal */}
      {/* The QrWithdrawModal component was removed as per the edit hint. */}
    </div>
  );
}