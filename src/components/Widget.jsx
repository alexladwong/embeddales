import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import tailwindStyles from "../index.css?inline";
import supabase from "../supabaseClient";

export const Widget = ({ projectId }) => {
  const [rating, setRating] = useState(3);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSelectStar = (index) => setRating(index + 1);

  const submit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.name.value || !form.email.value || !form.feedback.value) {
      alert("Please fill out all fields.");
      return;
    }

    const data = {
      p_project_id: projectId,
      p_user_name: form.name.value,
      p_user_email: form.email.value,
      p_message: form.feedback.value,
      p_rating: rating,
    };

    setLoading(true);
    try {
      const { data: returnedData, error } = await supabase.rpc("add_feedback", data);
      if (error) {
        console.error("Error submitting feedback:", error.message);
        alert("Failed to submit feedback. Please try again.");
        return;
      }
      setSubmitted(true);
      console.log("Feedback submitted successfully:", returnedData);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{tailwindStyles}</style>
      <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8">
        <Popover>
          <PopoverTrigger asChild>
            <Button className="rounded-full shadow-xl hover:scale-110 transition-all ease-in-out bg-violet-500 text-white hover:bg-sky-700 flex items-center gap-2 px-4 py-2">
              <MessageCircleIcon className="h-5 w-5 text-white" />
              <span className="hidden sm:inline">Feedback</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="rounded-lg bg-gradient-to-r from-violet-400 via-purple-300 to-sky-900 p-6 shadow-xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            {submitted ? (
              <div>
                <h3 className="text-xl font-bold text-white">Thank you for your feedback!</h3>
                <p className="mt-4 text-white">We appreciate your feedback. It helps us improve our product.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-white">Send us your feedback</h3>
                <form className="space-y-4" onSubmit={submit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Name</Label>
                      <Input id="name" placeholder="Enter your name" className="bg-white p-2 rounded-lg shadow-md" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input id="email" type="email" placeholder="Enter your email" className="bg-white p-2 rounded-lg shadow-md" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback" className="text-white">Feedback</Label>
                    <Textarea id="feedback" placeholder="Tell us what you think" className="min-h-[100px] bg-white p-2 rounded-lg shadow-md" />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, index) => (
                        <StarIcon key={index} onClick={() => onSelectStar(index)} className={`h-6 w-6 cursor-pointer ${rating > index ? "text-amber-300" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <Button type="submit" disabled={loading} className="bg-green-800 text-white hover:bg-violet-500 p-2 rounded-lg shadow-md transition-all duration-200">
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
            <Separator className="my-4 border-gray-400" />
            <div className="text-gray-200 text-center text-sm">
              Powered by <a href="https://ladwongfullstackdev.netlify.app" target="_blank" className="text-indigo-700 font-bold hover:underline">MrDollarInc. ⚡️⚡️⚡️</a>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

function StarIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function MessageCircleIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="7" rx="2" />
      <rect x="3" y="11" width="18" height="7" rx="2" />
    </svg>
  );
}
