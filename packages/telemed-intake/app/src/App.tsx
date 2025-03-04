import { ReactElement, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { MixpanelContextProps, ScrollToTop, setupMixpanel, setupSentry } from 'ottehr-components';
import { IntakeThemeProvider } from './IntakeThemeProvider';
import { ProtectedRoute } from './features/auth';
//import { Box, CircularProgress } from '@mui/material';
import { ErrorFallbackScreen, LoadingScreen } from './features/common';
import { useIOSAppSync } from './features/ios-communication/useIOSAppSync';
import './lib/i18n';
import AuthPage from './pages/AuthPage';
import CreateAccount from './pages/CreateAccount';
import ConfirmPhoneNumber from './pages/Registration/ConfirmPhoneNumber';
import PatientPortal from './pages/PatientPortal';
import { IOSPatientManageParticipantsPage } from './pages/IOS/IOSManageParticipantsPage';
import { IOSPatientPhotosEditPage } from './pages/IOS/IOSPatientPhotosEditPage';
import { IOSVideoCallMenu } from './pages/IOS/IOSVideoCallMenu';
import NewUser from './pages/NewUser';
import PaperworkPage from './pages/PaperworkPage';
import PastVisits from './pages/PastVisits';
import PatientCondition from './pages/PatientCondition';
import PatientInformation from './pages/PatientInformation';
import ReviewPaperwork from './pages/ReviewPaperwork';
import SelectPatient from './pages/SelectPatient';
import VideoChatPage from './pages/VideoChatPage';
import ChatRoomPage from './pages/ChatRoomPage';
import VisitDetails from './pages/VisitDetails';
import SetupBilling from './pages/Registration/SetupBilling';
import WaitingRoom from './pages/WaitingRoom';
import Welcome from './pages/Welcome';
import ConfirmDateOfBirth from './pages/ConfirmDateOfBirth';
import ThankYou from './pages/ThankYou';
import { useTranslation } from 'react-i18next';
import ScheduleSelect from './pages/ScheduleSelect';
import Version from './pages/Version';
import TagManager from "react-gtm-module";

const tagManagerArgs = {
  gtmId: "GTM-T7KBRSC8", // Replace with your GTM ID
};

TagManager.initialize(tagManagerArgs);


//if (isLowerEnvsOrProd) {
  setupSentry({
    dsn: "https://76defb25a25b004c1aa357f13fb5093b@o4508030553292800.ingest.us.sentry.io/4508888774541312",
   // environment: import.meta.env.MODE,
   // networkDetailAllowUrls: isLowerEnvs
    //  ? [import.meta.env.VITE_APP_FHIR_API_URL, import.meta.env.VITE_APP_PROJECT_API_URL]
    //  : [],
  });
//}

const MIXPANEL_SETTINGS: MixpanelContextProps = {
  token: import.meta.env.VITE_APP_MIXPANEL_TOKEN,
  registerProps: { appname: 'Telemed QRS' },
};

setupMixpanel(MIXPANEL_SETTINGS);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export class IntakeFlowPageRoute {
  static readonly ConfirmPhoneNumber = new IntakeFlowPageRoute('/auth/confirm-phone-number', <ConfirmPhoneNumber/>);
  static readonly SetupBilling = new IntakeFlowPageRoute('/auth/setup-billing', <SetupBilling/>);

  static readonly PatientPortal = new IntakeFlowPageRoute('/patient-portal', <PatientPortal />);
  static readonly ScheduleSelect = new IntakeFlowPageRoute('/schedule-select', <ScheduleSelect />);
  static readonly SelectPatient = new IntakeFlowPageRoute('/select-patient', <SelectPatient />);
  static readonly PastVisits = new IntakeFlowPageRoute('/past-visits', <PastVisits />);
  static readonly VisitDetails = new IntakeFlowPageRoute('/visit-details', <VisitDetails />);
  static readonly CreateAccount = new IntakeFlowPageRoute('/create-account', <CreateAccount />);
  static readonly PatientInformation = new IntakeFlowPageRoute('/about-patient', <PatientInformation />);
  static readonly ConfirmDateOfBirth = new IntakeFlowPageRoute('/confirm-date-of-birth', <ConfirmDateOfBirth />);
  static readonly AuthPage = new IntakeFlowPageRoute('/auth', <AuthPage />);
  static readonly Welcome = new IntakeFlowPageRoute('/:schedule-type/:slug/:visit-service/:visit-type', <Welcome />);
  static readonly NewUser = new IntakeFlowPageRoute('/new-user', <NewUser />);
  static readonly PatientCondition = new IntakeFlowPageRoute('/paperwork/patient-condition', <PatientCondition />);
  static readonly PaperworkPage = new IntakeFlowPageRoute('/paperwork/:slug', <PaperworkPage />);
  static readonly WaitingRoom = new IntakeFlowPageRoute('/waiting-room', <WaitingRoom />);
  static readonly InvitedWaitingRoom = new IntakeFlowPageRoute('/invited-waiting-room', <WaitingRoom />);
  static readonly ReviewPaperwork = new IntakeFlowPageRoute('/review-paperwork', <ReviewPaperwork />);
  static readonly VideoCall = new IntakeFlowPageRoute('/video-call', <VideoChatPage />);
  static readonly ChatRoom = new IntakeFlowPageRoute('/chat-room', <ChatRoomPage />);
  static readonly InvitedVideoCall = new IntakeFlowPageRoute('/invited-video-call', <VideoChatPage />);
  static readonly ThankYou = new IntakeFlowPageRoute('/thank-you', <ThankYou />);

  static readonly Version = new IntakeFlowPageRoute('/version', <Version />);

  static readonly IOSPatientPhotosEdit = new IntakeFlowPageRoute('/ios-patient-photos', <IOSPatientPhotosEditPage />);
  static readonly IOSPatientManageParticipants = new IntakeFlowPageRoute(
    '/ios-manage-participants',
    <IOSPatientManageParticipantsPage />,
  );
  static readonly IOSVideoCallMenu = new IntakeFlowPageRoute('/ios-video-call-menu', <IOSVideoCallMenu />);

  private constructor(
    public readonly path: string,
    public readonly page: ReactElement,
  ) {}
}

function App(): JSX.Element {

  useIOSAppSync();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('general.appName');

  }, [t]);

  return (
    <QueryClientProvider client={queryClient}>
      <IntakeThemeProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path={IntakeFlowPageRoute.Version.path} element={IntakeFlowPageRoute.Version.page} />
            <Route path={IntakeFlowPageRoute.AuthPage.path} element={IntakeFlowPageRoute.AuthPage.page} />
            <Route path={IntakeFlowPageRoute.ConfirmPhoneNumber.path} element={IntakeFlowPageRoute.ConfirmPhoneNumber.page} />
            <Route path={IntakeFlowPageRoute.Welcome.path} element={IntakeFlowPageRoute.Welcome.page} />
            <Route
              path={IntakeFlowPageRoute.InvitedWaitingRoom.path}
              element={IntakeFlowPageRoute.InvitedWaitingRoom.page}
            />
            <Route
              path={IntakeFlowPageRoute.InvitedVideoCall.path}
              element={IntakeFlowPageRoute.InvitedVideoCall.page}
            />
            <Route
              element={
                <ProtectedRoute
                  loadingFallback={<LoadingScreen />}
                  errorFallback={<ErrorFallbackScreen />}
                  unauthorizedFallback={<Navigate to={IntakeFlowPageRoute.AuthPage.path} />}
                />
              }
            >
              <Route path="/" element={<AuthPage />} />
              <Route path={IntakeFlowPageRoute.SetupBilling.path} element={IntakeFlowPageRoute.SetupBilling.page} />
              <Route path={IntakeFlowPageRoute.PatientPortal.path} element={IntakeFlowPageRoute.PatientPortal.page} />
              <Route path={IntakeFlowPageRoute.NewUser.path} element={IntakeFlowPageRoute.NewUser.page} />
              <Route path={IntakeFlowPageRoute.ScheduleSelect.path} element={IntakeFlowPageRoute.ScheduleSelect.page} />
              <Route path={IntakeFlowPageRoute.SelectPatient.path} element={IntakeFlowPageRoute.SelectPatient.page} />
              <Route path={IntakeFlowPageRoute.PastVisits.path} element={IntakeFlowPageRoute.PastVisits.page} />
              <Route path={IntakeFlowPageRoute.VisitDetails.path} element={IntakeFlowPageRoute.VisitDetails.page} />
              <Route path={IntakeFlowPageRoute.CreateAccount.path} element={IntakeFlowPageRoute.CreateAccount.page} />
              <Route
                path={IntakeFlowPageRoute.ConfirmDateOfBirth.path}
                element={IntakeFlowPageRoute.ConfirmDateOfBirth.page}
              />
              <Route
                path={IntakeFlowPageRoute.PatientInformation.path}
                element={IntakeFlowPageRoute.PatientInformation.page}
              />
              <Route path={IntakeFlowPageRoute.WaitingRoom.path} element={IntakeFlowPageRoute.WaitingRoom.page} />
              <Route
                path={IntakeFlowPageRoute.PatientCondition.path}
                element={IntakeFlowPageRoute.PatientCondition.page}
              />
              <Route path={IntakeFlowPageRoute.PaperworkPage.path} element={IntakeFlowPageRoute.PaperworkPage.page} />
              <Route
                path={IntakeFlowPageRoute.ReviewPaperwork.path}
                element={IntakeFlowPageRoute.ReviewPaperwork.page}
              />
              <Route path={IntakeFlowPageRoute.VideoCall.path} element={IntakeFlowPageRoute.VideoCall.page} />
              <Route path={IntakeFlowPageRoute.ChatRoom.path} element={IntakeFlowPageRoute.ChatRoom.page} />
            </Route>
            {/* TODO: make IOS routes be under protected route but without custom container */}
            <Route
              path={IntakeFlowPageRoute.IOSPatientPhotosEdit.path}
              element={IntakeFlowPageRoute.IOSPatientPhotosEdit.page}
            />
            <Route
              path={IntakeFlowPageRoute.IOSPatientManageParticipants.path}
              element={IntakeFlowPageRoute.IOSPatientManageParticipants.page}
            />
            <Route
              path={IntakeFlowPageRoute.IOSVideoCallMenu.path}
              element={IntakeFlowPageRoute.IOSVideoCallMenu.page}
            />
            <Route path={IntakeFlowPageRoute.ThankYou.path} element={IntakeFlowPageRoute.ThankYou.page} />
            <Route path="*" element={<Navigate to={IntakeFlowPageRoute.PatientPortal.path} />} />
          </Routes>
        </Router>
      </IntakeThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
