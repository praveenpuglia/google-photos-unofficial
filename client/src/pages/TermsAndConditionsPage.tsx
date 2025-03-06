import { Link } from 'react-router-dom';

const TermsAndConditionsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      <div className="mb-4">
        <Link to="/" className="text-blue-500 hover:underline">← Back to Home</Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="mb-2">
            By accessing or using the Google Photos Unofficial Viewer application ("the Application"), you agree to be bound by these Terms and Conditions and our Privacy Policy.
            If you do not agree to these terms, please do not use the Application.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
          <p className="mb-2">
            The Application provides a viewer for your Google Photos library, allowing you to browse and view your photos.
            The Application requires authentication with your Google account and permission to access your Google Photos.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">3. Google Account and API Usage</h2>
          <p className="mb-2">
            Our Application uses Google's authentication and Photos API. By using our Application, you acknowledge and agree that:
          </p>
          <ul className="list-disc pl-6">
            <li>You will provide accurate and complete information when connecting your Google account</li>
            <li>You are responsible for maintaining the confidentiality of your Google account credentials</li>
            <li>Your use of Google's services through our Application is subject to Google's Terms of Service</li>
            <li>We access your Google Photos data only with your explicit permission and for the purposes described in our Privacy Policy</li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. User Conduct</h2>
          <p className="mb-2">
            You agree not to:
          </p>
          <ul className="list-disc pl-6">
            <li>Use the Application for any illegal purpose or in violation of any laws</li>
            <li>Attempt to gain unauthorized access to any part of the Application</li>
            <li>Interfere with or disrupt the operation of the Application</li>
            <li>Reproduce, duplicate, copy, sell, or resell any portion of the Application</li>
            <li>Use the Application to transmit any malware, spyware, or other harmful code</li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
          <p className="mb-2">
            The Application, including its content, features, and functionality, is owned by us and is protected by copyright, trademark, and other intellectual property laws.
          </p>
          <p>
            Google Photos and related trademarks are the property of Google LLC. Our Application is not affiliated with, endorsed by, or sponsored by Google.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">6. Disclaimer of Warranties</h2>
          <p className="mb-2">
            THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            WE DO NOT GUARANTEE THAT THE APPLICATION WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
          <p className="mb-2">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THE APPLICATION.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">8. Modifications to Terms</h2>
          <p className="mb-2">
            We reserve the right to modify these Terms and Conditions at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last Updated" date.
          </p>
          <p>
            Your continued use of the Application after any changes constitutes your acceptance of the new Terms.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
          <p>
            We may terminate or suspend your access to the Application immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us at praveenpuglia@gmail.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage; 