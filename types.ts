export interface Vehicle {
  // Core fields
  regNo: string;
  fleetNo: string;
  vehicleDescription: string;
  vehicleModel: string;
  vehicleOwner: string;
  fuelLimit: number;
  user: string;
  designation: string;
  status: 'Active' | 'Inactive' | 'Maintenance' | string; // Allow other strings to be safe
  businessUnit: string;
  rentAmount: number;
  lastUpdated: string | Date;
  vehiclePhoto: string;
  
  // New fields from excel, mostly optional
  sNo?: number;
  sapNo?: string;
  category?: string;
  subCategory?: string;
  brand?: string;
  seatingCapacity?: number;
  capacityWith?: string;
  uom?: string;
  yom?: number;
  chassisNo?: string;
  engineNo?: string;
  cylinders?: number;
  registrationExpiry?: string | Date;
  insuranceExpiry?: string | Date;
  insuranceValidity?: string | Date;
  gps?: string;
  driverSapNo?: string;
  position?: string;
  contactNumber?: string | number;
  evrfNo?: string;
  onHireDate?: string | Date;
  offHireDate?: string | Date;
  lvrfNo?: string;
  lvrfApprovalType?: string;
  custodyDate?: string | Date;
  lvrfExpiry?: string | Date;
  fuelSensorOwner?: string;
  exfDate?: string | Date;
  fuelType?: string;
  rentedOrOwned?: string;
  contract?: string;
  project?: string;
  remarks?: string;
  replacementVehicle?: string;
  replacementVehicleRegExpiry?: string | Date;
  sourcingOfPmvs?: string;
  link?: string;
}