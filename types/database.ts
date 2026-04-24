export type UserRole = 'ADMIN' | 'ENGINEER' | 'REMOTE_AGENT' | 'CUSTOMER';
export type CustomerStatus = 'new' | 'active' | 'dealer';
export type InteractionType = 'call' | 'visit' | 'note';
export type OrderStatus = 'NEW' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type TaskStatus = 'pending' | 'in_progress' | 'done';
export type CommissionStatus = 'pending' | 'approved' | 'rejected';
export type NotificationType = 'crop_season' | 'product_expiry' | 'followup' | 'task' | 'general';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  region?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  location_lat?: number;
  location_lng?: number;
  region?: string;
  crop_type?: string;
  planting_date?: string;
  status: CustomerStatus;
  assigned_to?: string;
  user_id?: string;
  total_points: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  assigned_user?: User;
}

export interface Interaction {
  id: string;
  customer_id: string;
  engineer_id: string;
  date: string;
  type: InteractionType;
  note?: string;
  images: string[];
  next_followup?: string;
  created_at: string;
  engineer?: User;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  point_value: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface Prescription {
  id: string;
  customer_id: string;
  engineer_id: string;
  date: string;
  diagnosis?: string;
  usage_days: number;
  notes?: string;
  created_at: string;
  items?: PrescriptionItem[];
  engineer?: User;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  product_id: string;
  quantity: number;
  unit?: string;
  usage_instruction?: string;
  start_date?: string;
  expiry_date?: string;
  product?: Product;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  engineer_id?: string;
  status: OrderStatus;
  tracking_code?: string;
  shipment_company?: string;
  notes?: string;
  total_amount: number;
  total_points: number;
  is_field_sale: boolean;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  engineer?: User;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  points: number;
  product?: Product;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  min_stock: number;
  updated_at: string;
  product?: Product;
}

export interface EngineerInventory {
  id: string;
  engineer_id: string;
  product_id: string;
  quantity: number;
  updated_at: string;
  product?: Product;
}

export interface Task {
  id: string;
  assigned_to: string;
  assigned_by: string;
  customer_id?: string;
  title: string;
  description?: string;
  type: string;
  status: TaskStatus;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  customer?: Customer;
  assignee?: User;
  assigner?: User;
}

export interface Notification {
  id: string;
  user_id?: string;
  customer_id?: string;
  type: NotificationType;
  title: string;
  body?: string;
  is_read: boolean;
  trigger_date?: string;
  created_at: string;
  customer?: Customer;
}

export interface RewardRule {
  id: string;
  name: string;
  points_required: number;
  reward_value: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface RewardLog {
  id: string;
  customer_id: string;
  order_id?: string;
  type: 'earn' | 'redeem';
  points: number;
  description?: string;
  reward_rule_id?: string;
  created_at: string;
  reward_rule?: RewardRule;
}

export interface Commission {
  id: string;
  agent_id: string;
  order_id: string;
  amount: number;
  rate: number;
  status: CommissionStatus;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  agent?: User;
  order?: Order;
}
