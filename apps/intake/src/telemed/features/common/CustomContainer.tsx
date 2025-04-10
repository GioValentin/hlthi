import { CustomContainerFactory } from '../../../../../../custom-packages/ui-components/lib/components';
import { ottehrLogo } from '../../assets';
import Footer from '../../components/Footer';

export const CustomContainer = CustomContainerFactory({
  logo: ottehrLogo,
  alt: 'HLTHi',
  footer: <Footer />,
  showLanguagePicker: false,
});
