import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../engines/people/AuthProvider';
import { AppShell } from './AppShell';
import { RequireAuth, RequirePermission } from './guards';
import { FollowUpPage } from '../pages/FollowUpPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { PublicRegistrationPage } from '../pages/PublicRegistrationPage';

export function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<PublicRegistrationPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route element={<RequirePermission permission="follow_up.view" />}>
                <Route path="follow-up" element={<FollowUpPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
