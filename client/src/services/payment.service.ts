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
  usdt: {
    address: string;
    network: string;
  };
}

export interface CreateDepositResponse {
  success: boolean;
  message: string;
  txId: string;
}

export interface UploadProofResponse {
  success: boolean;
  message: string;
}

export interface DepositProof {
  _id: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  screenshot: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    username: string;
    email: string;
  };
  reason?: string;
}

export interface UpdateProofStatusRequest {
  status: 'approved' | 'rejected';
  reason?: string;
}

export type PaymentMethod = 'easypaisa' | 'jazzcash' | 'binance' | 'usdt';

export const paymentService = {
  /**
   * Fetches payment details for all available payment methods
   */
  async getPaymentDetails(): Promise<PaymentDetails> {
    const response = await api.get<PaymentDetails>('/api/payment-details');
    return response.data;
  },

  /**
   * Creates a new deposit request
   */
  async createDeposit(
    amount: number,
    method: PaymentMethod,
    referenceNumber?: string
  ): Promise<CreateDepositResponse> {
    const response = await api.post<CreateDepositResponse>('/api/user/deposit', {
      amount,
      method,
      referenceNumber
    });
    return response.data;
  },

  /**
   * Uploads payment proof for a deposit
   */
  async uploadPaymentProof(
    txId: string,
    file: File,
    referenceNumber?: string
  ): Promise<UploadProofResponse> {
    const formData = new FormData();
    formData.append('screenshot', file);
    if (referenceNumber) {
      formData.append('referenceNumber', referenceNumber);
    }

    const response = await api.post<UploadProofResponse>(`/api/deposits/${txId}/proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Fetches all deposit proofs (admin only)
   */
  async getDepositProofs(status?: 'pending' | 'approved' | 'rejected'): Promise<DepositProof[]> {
    const response = await api.get<DepositProof[]>('/api/admin/deposits/proofs', {
      params: status ? { status } : {},
    });
    return response.data;
  },

  /**
   * Updates the status of a deposit proof (admin only)
   */
  async updateProofStatus(
    proofId: string,
    data: { status: 'approved' | 'rejected'; reason?: string }
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.patch<{ success: boolean; message: string }>(
      `/api/admin/deposits/proofs/${proofId}/status`,
      data
    );
    return response.data;
  }
};

export type { PaymentDetails };