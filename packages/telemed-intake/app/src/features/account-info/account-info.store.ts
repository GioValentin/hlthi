import { Account } from 'ottehr-utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AccountInfoState = {
  accountInfo: Account;
  pendingAccountInfoUpdates?: Account;
};

type AccountInfoActions = {
  setNewAccount: () => void;
};

const BLANK_ACCOUNT_INFO: Account = {
    isNew: false,
    firstName: undefined,
    middleName: undefined,
    lastName: undefined,
    chosenName: undefined,
    sex: undefined,
    dateOfBirth: undefined,
    email: undefined,
    phone: undefined,
    phoneVerified: false,
    plan: undefined,
    billingId: undefined,
    billingPortal: undefined,
    address: undefined,
    sub: undefined
};

const NEW_ACCOUNT_INFO: Account = {
  ...BLANK_ACCOUNT_INFO,
  isNew: true,
};

const ACCOUNT_INFO_INITIAL: AccountInfoState = {
  accountInfo: BLANK_ACCOUNT_INFO,
};

export const useAccountInfoStore = create<AccountInfoState & AccountInfoActions>()(
  persist(
    (set) => ({
      ...ACCOUNT_INFO_INITIAL,
      setNewAccount: () =>
        set({
          accountInfo: { ...NEW_ACCOUNT_INFO },
          pendingAccountInfoUpdates: undefined,
        }),
    }),
    { name: 'telemed-account-info-storage' },
  ),
);
