import { cache, CACHE_KEYS } from './cache';

const API_BASE_URL = 'https://app.viktohs-sms.com/api';

// Cache TTLs
const COUNTRIES_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const SERVICES_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const PRICE_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirmation: string;
}

interface LoginRequest {
  login: string;
  password: string;
  remember?: boolean;
}

interface ForgotPasswordRequest {
  email: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_email_verified: boolean;
  balance: string;
  created_at: string;
  role?: string; // Optional role field (only present for admins)
}

export interface AuthResponse {
  success: true;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
  };
}

export interface ForgotPasswordResponse {
  success: true;
  message: string;
}

export interface Country {
  id: number;
  name: string;
  retry_available: boolean;
  rent_available: boolean;
  multi_service_available: boolean;
}

export interface CountriesResponse {
  success: true;
  data: {
    countries: Country[];
  };
}

export interface Service {
  code: string;
  name: string;
  available_count: number;
}

export interface ServicesResponse {
  success: true;
  data: {
    services: Service[];
    total_services: number;
  };
}

// ─── GrizzlySMS types ───────────────────────────────────────────────────────

export interface GrizzlyCountry {
  id: number;
  name: string;
  retry_available: boolean;
  rent_available: boolean;
  multi_service_available: boolean;
}

export interface GrizzlyCountriesResponse {
  success: true;
  data: { countries: GrizzlyCountry[] };
}

export interface GrizzlyService {
  code: string;
  name: string;
}

export interface GrizzlyServicesResponse {
  success: true;
  data: { services: GrizzlyService[] };
}

export interface GrizzlyPrice {
  cost: number | string;
  original_cost: number | string;
  count: number;
}

export interface GrizzlyPriceResponse {
  success: true;
  data: { [countryId: string]: { [serviceCode: string]: GrizzlyPrice } };
}

export interface GrizzlyPurchasedNumber {
  id: number;
  activation_id: string;
  phone_number: string;
  service: string;
  cost: number | string;
  status: 'waiting' | 'received' | 'completed' | 'cancelled' | 'expired';
  provider: string;
  expires_at: string;
  can_request_another_sms: boolean;
}

export interface GrizzlyPurchaseResponse {
  success: true;
  message: string;
  data: {
    purchased_number: GrizzlyPurchasedNumber;
    balance: { previous: number; current: number };
  };
}

export interface GrizzlyPurchaseError {
  success: false;
  message: string;
  error?: string;
  required?: number;
  available?: number;
}

export interface GrizzlyStatusWaiting {
  success: true;
  data: { status: 'waiting'; message: string; expires_at: string };
}

export interface GrizzlyStatusReceived {
  success: true;
  data: { status: 'received'; otp_code: string; sms_text?: string; received_at?: string };
}

export interface GrizzlyStatusError {
  success: false;
  message: string;
  status?: string;
}

export interface GrizzlyCancelResponse {
  success: true;
  message: string;
  data: { refunded_amount: number; current_balance: number };
}

// ─────────────────────────────────────────────────────────────────────────────

export interface DaisySMSService {
  service_code: string;
  service_name: string;
  final_cost: number | string; // API may return as string
  count: number;
  multi: number;
}

export interface DaisySMSServicesResponse {
  success: true;
  message: string;
  total_services: number;
  data: DaisySMSService[];
}

export interface DaisySMSRentedNumber {
  id: number;
  activation_id: string;
  phone_number: string;
  service: string;
  cost: number | string; // API may return as string
  status: 'waiting' | 'received' | 'completed' | 'cancelled' | 'expired';
  expires_at: string;
  provider: string;
}

export interface DaisySMSRentResponse {
  success: true;
  message: string;
  data: {
    rented_number: DaisySMSRentedNumber;
    balance: { current: number };
  };
}

export interface DaisySMSRentError {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
  required?: number;
  available?: number;
}

export interface DaisySMSCodeResponse {
  success: true;
  data: {
    status: 'received';
    otp_code: string;
    sms_text?: string;
    received_at?: string;
  };
}

export interface DaisySMSCodeError {
  success: false;
  message: string;
  error?: string;
  status?: string;
}


export interface DashboardStats {
  wallet_balance: number;
  total_sms_purchases: number;
  total_recharge: number;
}

export interface DashboardStatsResponse {
  success: true;
  data: DashboardStats;
}

export interface AdminDashboardStats {
  total_users: number;
  total_failed_orders: number;
  total_passed_orders: number;
  total_transactions: number;
  total_revenue: string;
}

export interface AdminDashboardStatsResponse {
  success: true;
  message: string;
  data: AdminDashboardStats;
}

export interface RecentUser {
  id: number;
  username: string;
  email: string;
  balance: string;
}

export interface RecentTransaction {
  id: number;
  email: string;
  type: 'credit' | 'debit';
  amount: string;
  reference: string;
}

export interface AdminRecentStats {
  recent_users: RecentUser[];
  recent_transactions: RecentTransaction[];
}

export interface AdminRecentStatsResponse {
  success: true;
  message: string;
  data: AdminRecentStats;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  balance: string;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface AdminUsersData {
  current_page: number;
  data: AdminUser[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface AdminUsersResponse {
  status: true;
  message: string;
  data: AdminUsersData;
}

export interface UpdateBalanceRequest {
  user_id: number;
  amount: number;
  type: 'credit' | 'debit';
}

export interface UpdateBalanceResponse {
  status: true;
  message: string;
  data: {
    user_id: number;
    new_balance: number;
  };
}

export interface UpdateBalanceError {
  status: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface AdminTransaction {
  id: number;
  user_id: number;
  amount: string;
  type: 'credit' | 'debit' | 'refund';
  description: string;
  created_at: string;
  user: {
    id: number;
    email: string;
  };
}

export interface AdminTransactionsData {
  current_page: number;
  data: AdminTransaction[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface AdminTransactionsResponse {
  status: true;
  message: string;
  data: AdminTransactionsData;
}

export interface BalanceResponse {
  success: true;
  data: {
    wallet_balance: number;
  };
}

export interface MeResponse {
  success: true;
  data: {
    user: {
      username: string;
      email: string;
      phone: string;
      is_email_verified: boolean;
      balance: string;
      created_at: string;
    };
  };
}

export interface LogoutResponse {
  success: true;
  message: string;
}

export interface NumberHistory {
  id: number;
  user_id: number;
  service_id: number;
  activation_id: string;
  phone_number: string;
  service_code: string;
  country_code: string;
  operator: string;
  cost: string;
  currency: number;
  status: string;
  otp_code: string | null;
  sms_text: string | null;
  activation_time: string;
  code_received_at: string | null;
  expires_at: string;
  can_request_another_sms: boolean;
  created_at: string;
  updated_at: string;
  provider: string;
  daisy_service_name: string | null;
  service: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    icon: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
  };
}

export interface NumberHistoryResponse {
  success: true;
  data: {
    numbers: NumberHistory[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

export interface ServicePrice {
  cost: number;
  original_cost: string;
  count: number;
  physicalCount?: number;
  freePriceMap?: Record<string, number>;
}

export interface ServicePriceResponse {
  success: true;
  data: {
    [countryId: string]: {
      [serviceCode: string]: ServicePrice;
    };
  };
}

export interface PurchasedNumber {
  id: number;
  activation_id: number;
  phone_number: string;
  service: string;
  cost: number;
  status: string;
  expires_at: string;
  can_request_another_sms: boolean;
}

export interface PurchaseNumberResponse {
  success: true;
  message: string;
  data: {
    purchased_number: PurchasedNumber;
    balance: {
      previous: number;
      current: number;
    };
  };
}

export interface PurchaseNumberError {
  success: false;
  message: string;
  error?: string;
  required?: number;
  available?: number;
  errors?: Record<string, string[]>;
}

export interface CancelActivationResponse {
  success: true;
  message: string;
  data: {
    refunded_amount: number;
    current_balance: number;
  };
}

export interface CancelActivationError {
  success: false;
  message: string;
  error?: string;
}

export interface CompleteActivationResponse {
  success: true;
  message: string;
  data: {
    status: string;
  };
}

export interface CompleteActivationError {
  success: false;
  message: string;
  error?: string;
}

export interface NumberStatusResponse {
  success: true;
  data: {
    status: string;
    otp_code?: string;
    sms_text?: string;
    received_at?: string;
  };
}

export interface NumberStatusError {
  success: false;
  message: string;
  status?: string;
  error?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  purchased_number_id: number | null;
  type: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  reference: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface TransactionsResponse {
  success: true;
  data: {
    numbers: Transaction[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

export interface AdminSettings {
  id: number;
  sms_activate_exc_rate: string;
  sms_activate_top_up: string;
  daisy_sms_exc_rate: string;
  daisy_sms_top_up: string;
  grizzly_sms_exc_rate: string;
  grizzly_sms_top_up: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSettingsResponse {
  success: true;
  data: AdminSettings;
}

export interface UpdateAdminSettingsRequest {
  sms_activate_exc_rate?: number;
  sms_activate_top_up?: number;
  daisy_sms_exc_rate?: number;
  daisy_sms_top_up?: number;
  grizzly_sms_exc_rate?: number;
  grizzly_sms_top_up?: number;
}

export interface UpdateAdminSettingsResponse {
  success: true;
  message: string;
  data: AdminSettings;
}

export interface UpdateAdminSettingsError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface AdminOrder {
  id: number;
  phone_number: string;
  service_code: string;
  country_code: string;
  cost: string;
  otp_code: string | null;
  status: string;
  provider: string;
  created_at: string;
  user: {
    email: string;
  };
}

export interface AdminOrdersData {
  current_page: number;
  data: AdminOrder[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface AdminOrdersResponse {
  status: true;
  message: string;
  data: AdminOrdersData;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number = 30000; // 30 seconds timeout
  private maxRetries: number = 2; // Retry failed requests up to 2 times
  private pendingRequests: Map<string, Promise<any>> = new Map(); // Request deduplication

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Generate a unique key for request deduplication
  private getRequestKey(endpoint: string, options: RequestInit): string {
    return `${options.method || 'GET'}_${endpoint}_${JSON.stringify(options.body || '')}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = this.defaultTimeout,
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Check for pending requests (only for GET requests)
    const isGetRequest = !options.method || options.method === 'GET';
    const requestKey = this.getRequestKey(endpoint, options);
    
    if (isGetRequest && this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey) as Promise<T>;
    }

    // Create the promise for this request
    const requestPromise = (async () => {
      try {
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        // Check for Unauthenticated response
        if (data.message === 'Unauthenticated' || data.message === 'Unauthenticated.') {
          // Clear auth data
          this.removeToken();
          // Redirect to login
          window.location.href = '/login';
          throw {
            success: false,
            message: 'Session expired. Please login again.',
            error: 'UNAUTHENTICATED'
          };
        }

        if (!response.ok) {
          throw data;
        }

        return data;
      } catch (error: any) {
        // Check for Unauthenticated in error response
        if (error.message === 'Unauthenticated' || error.message === 'Unauthenticated.') {
          // Clear auth data
          this.removeToken();
          // Redirect to login
          window.location.href = '/login';
          throw {
            success: false,
            message: 'Session expired. Please login again.',
            error: 'UNAUTHENTICATED'
          };
        }

        // Handle timeout errors
        if (error.name === 'AbortError') {
          // Retry on timeout if we haven't exceeded max retries
          if (retryCount < this.maxRetries) {
            console.log(`Request timeout. Retrying... (Attempt ${retryCount + 1}/${this.maxRetries})`);
            await this.delay(1000 * (retryCount + 1)); // Exponential backoff
            return this.request<T>(endpoint, options, timeout, retryCount + 1);
          }
          
          throw {
            success: false,
            message: 'Request timeout. Please check your internet connection and try again.',
            error: 'TIMEOUT'
          };
        }

        // Retry on network errors (except 4xx client errors)
        if (error.name === 'TypeError' && retryCount < this.maxRetries) {
          console.log(`Network error. Retrying... (Attempt ${retryCount + 1}/${this.maxRetries})`);
          await this.delay(1000 * (retryCount + 1)); // Exponential backoff
          return this.request<T>(endpoint, options, timeout, retryCount + 1);
        }

        throw error;
      } finally {
        // Remove the request from pending requests
        this.pendingRequests.delete(requestKey);
      }
    })();

    // Store the promise for deduplication (only for GET requests)
    if (isGetRequest) {
      this.pendingRequests.set(requestKey, requestPromise);
    }

    return requestPromise;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store token
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }
    
    return response;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store token
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }
    
    return response;
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return this.request<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Services endpoints with caching
  async getCountries(forceRefresh: boolean = false): Promise<CountriesResponse> {
    // Check cache first
    if (!forceRefresh) {
      const cached = cache.get<CountriesResponse>(CACHE_KEYS.COUNTRIES);
      if (cached) {
        return cached;
      }
    }

    // Fetch from API
    const response = await this.request<CountriesResponse>('/auth/services/countries', {
      method: 'GET',
    });

    // Cache the response
    if (response.success) {
      cache.set(CACHE_KEYS.COUNTRIES, response, COUNTRIES_CACHE_TTL);
    }

    return response;
  }

  async getServicesByCountry(countryId: number, forceRefresh: boolean = false): Promise<ServicesResponse> {
    const cacheKey = CACHE_KEYS.SERVICES(countryId);

    // Check cache first
    if (!forceRefresh) {
      const cached = cache.get<ServicesResponse>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Fetch from API
    const response = await this.request<ServicesResponse>(`/auth/services/by-country?country=${countryId}`, {
      method: 'GET',
    });

    // Cache the response
    if (response.success) {
      cache.set(cacheKey, response, SERVICES_CACHE_TTL);
    }

    return response;
  }

  // DaisySMS — List services
  async getDaisySMSServices(forceRefresh: boolean = false): Promise<DaisySMSServicesResponse> {
    const cacheKey = 'daisysms_services';

    if (!forceRefresh) {
      const cached = cache.get<DaisySMSServicesResponse>(cacheKey);
      if (cached) return cached;
    }

    const response = await this.request<DaisySMSServicesResponse>('/auth/daisysms/services', {
      method: 'GET',
    });

    if (response.success) {
      cache.set(cacheKey, response, SERVICES_CACHE_TTL);
    }

    return response;
  }

  // DaisySMS — Rent a number
  async rentDaisySMSNumber(serviceCode: string): Promise<DaisySMSRentResponse> {
    return this.request<DaisySMSRentResponse>('/auth/daisysms/rent', {
      method: 'POST',
      body: JSON.stringify({ service: serviceCode }),
    });
  }

  // DaisySMS — Poll for OTP code (id = local PurchasedNumber.id)
  async getDaisySMSCode(numberId: number): Promise<DaisySMSCodeResponse | DaisySMSCodeError> {
    return this.request<DaisySMSCodeResponse | DaisySMSCodeError>(`/auth/daisysms/${numberId}/get-code`, {
      method: 'GET',
    });
  }

  // DaisySMS — Mark as done (only after code received)
  async markDaisySMSDone(numberId: number): Promise<{ success: true; message: string }> {
    return this.request<{ success: true; message: string }>(`/auth/daisysms/${numberId}/mark-done`, {
      method: 'POST',
    });
  }

  // DaisySMS — Cancel (only while waiting)
  async cancelDaisySMSActivation(numberId: number): Promise<CancelActivationResponse> {
    return this.request<CancelActivationResponse>(`/auth/daisysms/${numberId}/cancel`, {
      method: 'POST',
    });
  }

  // Clear cache methods
  clearCountriesCache(): void {
    cache.remove(CACHE_KEYS.COUNTRIES);
  }

  clearServicesCache(countryId?: number): void {
    if (countryId) {
      cache.remove(CACHE_KEYS.SERVICES(countryId));
    } else {
      // Clear all services cache
      cache.clearAll();
    }
  }

  clearAllCache(): void {
    cache.clearAll();
  }


  // Dashboard Stats endpoint
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    return this.request<DashboardStatsResponse>('/auth/dashboard/stats', {
      method: 'GET',
    });
  }

  // Admin Dashboard Stats endpoint
  async getAdminDashboardStats(): Promise<AdminDashboardStatsResponse> {
    return this.request<AdminDashboardStatsResponse>('/auth/admin/dashboard/stats', {
      method: 'GET',
    });
  }

  // Admin Recent Stats endpoint
  async getAdminRecentStats(): Promise<AdminRecentStatsResponse> {
    return this.request<AdminRecentStatsResponse>('/auth/admin/dashboard/recent-stats', {
      method: 'GET',
    });
  }

  // Admin Get Users endpoint (paginated)
  async getAdminUsers(page: number = 1, search?: string): Promise<AdminUsersResponse> {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    return this.request<AdminUsersResponse>(`/auth/admin/getUsers?page=${page}${searchParam}`, {
      method: 'GET',
    });
  }

  // Update Balance endpoint
  async updateBalance(data: UpdateBalanceRequest): Promise<UpdateBalanceResponse | UpdateBalanceError> {
    return this.request<UpdateBalanceResponse | UpdateBalanceError>('/auth/admin/update-balance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin Get Transactions endpoint (paginated)
  async getAdminTransactions(page: number = 1, search?: string): Promise<AdminTransactionsResponse> {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    return this.request<AdminTransactionsResponse>(`/auth/admin/getTransactions?page=${page}${searchParam}`, {
      method: 'GET',
    });
  }

  // Korapay — initialize a payment session (backend owns reference + amount)
  async initializeKorapay(amount: number): Promise<{
    success: true;
    data: {
      public_key: string;
      reference: string;
      amount: number;
      currency: string;
      customer: { name: string; email: string };
    };
  }> {
    return this.request('/auth/korapay/initialize', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Me endpoint
  async getMe(): Promise<MeResponse> {
    return this.request<MeResponse>('/auth/me', {
      method: 'GET',
    });
  }

  // Balance endpoint
  async getBalance(): Promise<BalanceResponse> {
    return this.request<BalanceResponse>('/auth/dashboard/balance', {
      method: 'GET',
    });
  }

  // Number History endpoint
  async getNumberHistory(): Promise<NumberHistoryResponse> {
    return this.request<NumberHistoryResponse>('/auth/numbers/my-numbers', {
      method: 'GET',
    });
  }

  // Transactions endpoint
  async getTransactions(): Promise<TransactionsResponse> {
    return this.request<TransactionsResponse>('/auth/transactions/me', {
      method: 'GET',
    });
  }

  // Logout endpoints
  async logoutCurrentDevice(): Promise<LogoutResponse> {
    return this.request<LogoutResponse>('/auth/logout', {
      method: 'POST',
    });
  }

  async logoutAllDevices(): Promise<LogoutResponse> {
    return this.request<LogoutResponse>('/auth/logout-all', {
      method: 'POST',
    });
  }

  // Service Price endpoint
  async getServicePrice(serviceCode: string, countryId: number, forceRefresh: boolean = false): Promise<ServicePriceResponse> {
    const cacheKey = `price_${serviceCode}_${countryId}`;

    // Check cache first
    if (!forceRefresh) {
      const cached = cache.get<ServicePriceResponse>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Fetch from API
    const response = await this.request<ServicePriceResponse>(`/auth/services/prices?service=${serviceCode}&country=${countryId}`, {
      method: 'GET',
    });

    // Cache the response
    if (response.success) {
      cache.set(cacheKey, response, PRICE_CACHE_TTL);
    }

    return response;
  }

  // Purchase Number endpoint
  async purchaseNumber(serviceCode: string, countryId: number): Promise<PurchaseNumberResponse> {
    return this.request<PurchaseNumberResponse>('/auth/numbers/purchase', {
      method: 'POST',
      body: JSON.stringify({
        service_code: serviceCode,
        country: countryId,
      }),
    });
  }

  // Cancel Activation endpoint
  async cancelActivation(numberId: number): Promise<CancelActivationResponse> {
    return this.request<CancelActivationResponse>(`/auth/numbers/${numberId}/cancel`, {
      method: 'POST',
    });
  }

  // Complete Activation endpoint
  async completeActivation(numberId: number): Promise<CompleteActivationResponse> {
    return this.request<CompleteActivationResponse>(`/auth/numbers/${numberId}/complete`, {
      method: 'POST',
    });
  }

  // Get Number Status endpoint
  async getNumberStatus(numberId: number): Promise<NumberStatusResponse | NumberStatusError> {
    return this.request<NumberStatusResponse | NumberStatusError>(`/auth/numbers/${numberId}/status`, {
      method: 'GET',
    });
  }

  // Admin Settings endpoint
  async getAdminSettings(): Promise<AdminSettingsResponse> {
    return this.request<AdminSettingsResponse>('/auth/admin/settings/rate-topup', {
      method: 'GET',
    });
  }

  // Update Admin Settings endpoint
  async updateAdminSettings(data: UpdateAdminSettingsRequest): Promise<UpdateAdminSettingsResponse | UpdateAdminSettingsError> {
    return this.request<UpdateAdminSettingsResponse | UpdateAdminSettingsError>('/auth/admin/settings/rate-topup', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ─── GrizzlySMS endpoints (/api/v1/grizzlysms/*) ──────────────────────────

  async getGrizzlyCountries(): Promise<GrizzlyCountriesResponse> {
    return this.request<GrizzlyCountriesResponse>('/auth/grizzlysms/countries', { method: 'GET' });
  }

  async getGrizzlyServices(countryId?: number): Promise<GrizzlyServicesResponse> {
    const q = countryId ? `?country=${countryId}` : '';
    return this.request<GrizzlyServicesResponse>(`/auth/grizzlysms/services${q}`, { method: 'GET' });
  }

  async getGrizzlyPrice(serviceCode: string, countryId: number): Promise<GrizzlyPriceResponse> {
    return this.request<GrizzlyPriceResponse>(
      `/auth/grizzlysms/prices?service=${serviceCode}&country=${countryId}`,
      { method: 'GET' }
    );
  }

  async purchaseGrizzlyNumber(serviceCode: string, countryId: number): Promise<GrizzlyPurchaseResponse> {
    return this.request<GrizzlyPurchaseResponse>('/auth/grizzlysms/purchase', {
      method: 'POST',
      body: JSON.stringify({ service_code: serviceCode, country: countryId }),
    });
  }

  async getGrizzlyStatus(id: number): Promise<GrizzlyStatusWaiting | GrizzlyStatusReceived | GrizzlyStatusError> {
    return this.request<GrizzlyStatusWaiting | GrizzlyStatusReceived | GrizzlyStatusError>(
      `/auth/grizzlysms/${id}/status`,
      { method: 'GET' }
    );
  }

  async requestGrizzlySms(id: number): Promise<{ success: true; message: string }> {
    return this.request<{ success: true; message: string }>(`/auth/grizzlysms/${id}/request-sms`, { method: 'POST' });
  }

  async completeGrizzlyActivation(id: number): Promise<{ success: true; message: string }> {
    return this.request<{ success: true; message: string }>(`/auth/grizzlysms/${id}/complete`, { method: 'POST' });
  }

  async cancelGrizzlyActivation(id: number): Promise<GrizzlyCancelResponse> {
    return this.request<GrizzlyCancelResponse>(`/auth/grizzlysms/${id}/cancel`, { method: 'POST' });
  }

  // ─────────────────────────────────────────────────────────────────────────

  // Admin Get Orders endpoint (paginated)
  async getAdminOrders(page: number = 1, search?: string): Promise<AdminOrdersResponse> {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    return this.request<AdminOrdersResponse>(`/auth/admin/getOrder?page=${page}${searchParam}`, {
      method: 'GET',
    });
  }

  // Token management
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // User management
  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.removeToken();
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

// Helper to format API errors
export function formatApiError(error: ApiError): string {
  if (error.errors) {
    // Get first error message from errors object
    const firstErrorKey = Object.keys(error.errors)[0];
    return error.errors[firstErrorKey][0];
  }
  return error.message || 'An error occurred. Please try again.';
}

// Helper to get all validation errors
export function getValidationErrors(error: ApiError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  if (error.errors) {
    Object.keys(error.errors).forEach(key => {
      formattedErrors[key] = error.errors![key][0];
    });
  }
  
  return formattedErrors;
}