import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import React from "react";

export default function SubmissionVerifyForm( { submissionId }: { submissionId: string }) {
  const { data: session } = useSession();

  if (!session?.user.verifier) {
    return(
      <></>
    );
  }

  const [verified, setVerified] = useState(false);
  const [verifierNotes, setVerifierNotes] = useState<string>('');
    const [submitStatus, setSubmitStatus] = useState<{
      success: boolean;
      message: string;
    } | null>(null);

  useEffect(() => {
      const fetchInitialData = async () => {
        try {
          const submissionRes = await fetch(`/api/submissions/${submissionId}`);
          const submissionData = await submissionRes.json();
          console.log(submissionData);
          setVerified(submissionData.verified);
          setVerifierNotes(submissionData.additionalVerifierNotes);
          
        } catch (error) {
          console.error('Failed to fetch initial data:', error);
        }
      };
      
      fetchInitialData();
    }, []);
  
  const handleVerifierSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
  
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append("submissionId", submissionId);
      formDataToSend.append("verified", verified ? "true" : "false");
      formDataToSend.append("verifierNotes", verifierNotes);

      console.log(formDataToSend);
      
      // Submit the form
      const response = await fetch('/api/submissions/verify-edit', {
        method: 'POST',
        body: formDataToSend,
        // Don't set Content-Type header - the browser will set it with the boundary for FormData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to edit run verification');
      }
      
      setSubmitStatus({
        success: true,
        message: 'Verification edited successfully!',
      });
      
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
      console.error(error);
    }
  };

  return(
    <form onSubmit={handleVerifierSubmit}>
      <div className="p-6 border-t border-gray-200">
        {submitStatus && (
          <div 
            className={`p-4 mb-4 rounded-md ${
              submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {submitStatus.message}
          </div>
        )}
        <h2 className="text-xl font-semibold mb-4">Verified</h2>
        <div key="verified" className="flex items-center">
          <input
            type="checkbox"
            id="verified"
            name="verified"
            value="verified"
            checked={verified}
            onChange={(e => {setVerified(e.target.checked)})}
            className="mr-2"
          />
        </div>
        <h2 className="text-xl font-semibold mb-4">Verifier Notes</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <textarea
            id="verifierNotes"
            name="verifierNotes"
            value={verifierNotes}
            onChange={(e) => setVerifierNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md h-16 resize-y"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
        >
          Save Changes
        </button>
        <button 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
          onClick={() => {window.location.href=`/submissions/${submissionId}`}}
        >
          Return to Normal View
        </button>
      </div>
    </form>
  )
}