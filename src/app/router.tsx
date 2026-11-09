import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/features/home/HomePage'
import { CategoriesPage } from '@/features/categories/CategoriesPage'
import { CategoryDetailPage } from '@/features/categories/CategoryDetailPage'
import { RatesPage } from '@/features/rates/RatesPage'
import { PhoneAuthPage } from '@/features/auth/PhoneAuthPage'
import { EmailAuthPage } from '@/features/auth/EmailAuthPage'
import { PasswordRecoverPage } from '@/features/auth/PasswordRecoverPage'
import { OnboardingPage } from '@/features/profile/OnboardingPage'
import { AccountPage } from '@/features/profile/AccountPage'
import { AddressesPage } from '@/features/addresses/AddressesPage'
import { BookScrapPage } from '@/features/bookings/BookScrapPage'
import { BookingsListPage } from '@/features/bookings/BookingsListPage'
import { BookingDetailPage } from '@/features/bookings/BookingDetailPage'
import { SellItemPage } from '@/features/sell-requests/SellItemPage'
import { SellRequestDetailPage } from '@/features/sell-requests/SellRequestDetailPage'
import { QuotationDetailPage } from '@/features/quotations/QuotationDetailPage'
import { PaymentsPage } from '@/features/payments/PaymentsPage'
import { NotificationsPage } from '@/features/notifications/NotificationsPage'
import { SupportPage } from '@/features/support/SupportPage'
import { NotFoundPage } from '@/features/common/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'categories/:slug', element: <CategoryDetailPage /> },
      { path: 'rates', element: <RatesPage /> },
      { path: 'auth/phone', element: <PhoneAuthPage /> },
      { path: 'auth/email', element: <EmailAuthPage /> },
      { path: 'auth/recover', element: <PasswordRecoverPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: 'account/addresses', element: <AddressesPage /> },
      { path: 'book/scrap', element: <BookScrapPage /> },
      { path: 'bookings', element: <BookingsListPage /> },
      { path: 'bookings/:id', element: <BookingDetailPage /> },
      { path: 'sell-item', element: <SellItemPage /> },
      { path: 'sell-requests/:id', element: <SellRequestDetailPage /> },
      { path: 'quotations/:id', element: <QuotationDetailPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'support', element: <SupportPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
