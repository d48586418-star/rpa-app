export type AccountType = 'freelancer' | 'empresa';

export type Profile = {
  id: string;
  account_type: AccountType;
  website: string | null;
  name: string;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  roles: string[];
  day_rate_min: number | null;
  day_rate_max: number | null;
  available: boolean;
  portfolio_links: string[];
  gear: string | null;
};

export type Match = {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
};

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};
