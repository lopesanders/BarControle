export interface ConsumptionItem {
  id: string;
  name: string;
  price: number;
  timestamp: number;
  photo?: string;
}

export interface ConsumptionSession {
  id: string;
  items: ConsumptionItem[];
  date: number;
  total: number;
  splitCount: number;
  hasTip: boolean;
  tipAmount: number;
  totalPerPerson: number;
  location?: string;
}

export type View = 'active' | 'history' | 'help';