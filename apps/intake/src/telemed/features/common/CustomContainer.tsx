import { CustomContainerFactory } from '../../../../../../custom-packages/ui-components/lib/components';
import Footer from '../../components/Footer';
import { PROJECT_NAME } from 'utils';
import { ottehrLogo } from '@theme/index';

export const CustomContainer = CustomContainerFactory({
  logo: ottehrLogo,
  alt: PROJECT_NAME,
  footer: <Footer />,
  showLanguagePicker: false,
});
