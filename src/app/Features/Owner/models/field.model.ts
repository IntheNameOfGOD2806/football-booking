export interface Field {
  id: string;
  name: string;
  type: 'football' | 'basketball' | 'tennis' | 'volleyball' | 'other';
  description: string;
  pricePerHour: number;
  capacity: number;
  amenities: string[];
  imageUrl: string;
  status: 'active' | 'inactive' | 'maintenance';
  address: string;
  operatingHours: {
    start: string;
    end: string;
  };
  createdAt: Date;
}

export interface Booking {
  id: string;
  fieldId: string;
  fieldName: string;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface DashboardStats {
  totalFields: number;
  activeBookings: number;
  monthlyRevenue: number;
  totalBookings: number;
}
