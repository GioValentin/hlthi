import { CustomContainerFactory } from 'ottehr-components';
import { ottehrLogo } from '../assets';
import Footer from './Footer';

const imageForBackground = (page: string): string => {
  switch (page) {
    default:
      return ottehrLogo;
  }
};
const CustomContainer = CustomContainerFactory(imageForBackground, ottehrLogo, 'HLTHi telemedicine', <Footer />);
export default CustomContainer;
