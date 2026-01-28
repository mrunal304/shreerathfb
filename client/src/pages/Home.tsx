import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFeedbackSchema, type InsertFeedback } from "@shared/schema";
import { useCreateFeedback } from "@/hooks/use-feedback";
import { useToast } from "@/hooks/use-toast";
import { RatingInput } from "@/components/RatingInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, UtensilsCrossed, PartyPopper, ChefHat } from "lucide-react";

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const createFeedback = useCreateFeedback();

  const form = useForm<InsertFeedback>({
    resolver: zodResolver(insertFeedbackSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      note: "",
      ratings: {
        food: 0,
        service: 0,
        interior: 0,
        staff: 0,
        hygiene: 0,
      },
    },
  });

  const onSubmit = (data: InsertFeedback) => {
    createFeedback.mutate(data, {
      onSuccess: () => {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Submission failed",
          description: error.message,
        });
      },
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Confetti-like background elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 text-primary animate-bounce delay-100"><UtensilsCrossed size={48} /></div>
          <div className="absolute top-20 right-20 text-accent animate-bounce delay-300"><ChefHat size={48} /></div>
          <div className="absolute bottom-10 left-1/4 text-secondary animate-bounce delay-500"><PartyPopper size={48} /></div>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl relative z-10 border-2 border-primary/10"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <PartyPopper className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold font-display text-primary mb-4">Thank You!</h1>
          <p className="text-secondary/80 text-lg mb-8">
            We appreciate your feedback. It helps us serve you better. We hope to see you again soon!
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl"
          >
            Submit Another Response
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4">
            <UtensilsCrossed className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary font-display mb-3 tracking-tight">
            How was your experience?
          </h1>
          <p className="text-lg text-secondary/70 max-w-xl mx-auto">
            We value your opinion. Please take a moment to rate your visit at our restaurant.
          </p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-orange-400 to-yellow-400" />
            <CardHeader className="bg-white/50 backdrop-blur-sm pb-2">
              <CardTitle className="text-xl font-bold text-secondary">Feedback Form</CardTitle>
              <CardDescription>Tell us about your visit today</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 bg-white/80 backdrop-blur-md">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Contact Info Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-secondary font-semibold">Your Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              className="h-12 rounded-xl bg-background border-input focus:border-primary focus:ring-primary/20" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-secondary font-semibold">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="9876543210" 
                              type="tel"
                              maxLength={10}
                              className="h-12 rounded-xl bg-background border-input focus:border-primary focus:ring-primary/20" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="h-px bg-border/50" />

                  {/* Ratings Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-secondary font-display">Rate Your Experience</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                      <FormField
                        control={form.control}
                        name="ratings.food"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RatingInput 
                                label="Food Quality" 
                                value={field.value} 
                                onChange={field.onChange} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ratings.service"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RatingInput 
                                label="Service Speed" 
                                value={field.value} 
                                onChange={field.onChange} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ratings.interior"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RatingInput 
                                label="Ambience & Interior" 
                                value={field.value} 
                                onChange={field.onChange} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ratings.staff"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RatingInput 
                                label="Staff Behavior" 
                                value={field.value} 
                                onChange={field.onChange} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ratings.hygiene"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RatingInput 
                                label="Hygiene & Cleanliness" 
                                value={field.value} 
                                onChange={field.onChange} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-secondary font-semibold">Additional Comments (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us what you loved or what we can improve..." 
                            className="min-h-[120px] rounded-xl bg-background border-input focus:border-primary focus:ring-primary/20 resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={createFeedback.isPending}
                    className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 shadow-lg shadow-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {createFeedback.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
        
        <p className="text-center text-secondary/40 text-sm mt-8 pb-4">
          © {new Date().getFullYear()} Restaurant Name. All rights reserved.
        </p>
      </div>
    </div>
  );
}
