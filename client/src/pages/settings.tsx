import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Please select a theme.",
  }),
  animations: z.boolean(),
});

const aiModelFormSchema = z.object({
  defaultModel: z.enum(["openai", "gemini", "groq"], {
    required_error: "Please select a default AI model.",
  }),
});

const apiKeysFormSchema = z.object({
  openaiApiKey: z.string().optional(),
  googleApiKey: z.string().optional(),
  groqApiKey: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;
type AIModelFormValues = z.infer<typeof aiModelFormSchema>;
type ApiKeysFormValues = z.infer<typeof apiKeysFormSchema>;

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
  });
  
  // Appearance form
  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
      animations: true,
    },
  });
  
  // AI Model form
  const aiModelForm = useForm<AIModelFormValues>({
    resolver: zodResolver(aiModelFormSchema),
    defaultValues: {
      defaultModel: "openai",
    },
  });
  
  // API Keys form
  const apiKeysForm = useForm<ApiKeysFormValues>({
    resolver: zodResolver(apiKeysFormSchema),
    defaultValues: {
      openaiApiKey: "",
      googleApiKey: "",
      groqApiKey: "",
    },
  });
  
  // Fetch user settings on component mount
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching settings: ${response.status}`);
        }
        
        const settings = await response.json();
        
        // Set default AI model
        if (settings.defaultAiModel) {
          aiModelForm.setValue('defaultModel', settings.defaultAiModel);
        }
        
        // We don't set API keys because the server only returns placeholders
      } catch (error) {
        console.error("Error fetching user settings:", error);
      }
    };
    
    fetchSettings();
  }, [aiModelForm]);
  
  // Handle profile form submission
  function onProfileSubmit(data: ProfileFormValues) {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated.",
    });
  }
  
  // Handle appearance form submission
  function onAppearanceSubmit(data: AppearanceFormValues) {
    const theme = data.theme;
    
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      localStorage.removeItem('theme');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    toast({
      title: "Appearance updated",
      description: "Your appearance settings have been updated.",
    });
  }
  
  // Handle AI model form submission
  function onAIModelSubmit(data: AIModelFormValues) {
    // Save to server with current API keys
    saveSettings({ 
      defaultAiModel: data.defaultModel,
    });
    
    toast({
      title: "AI Model preference updated",
      description: "Your default AI model has been set to " + 
        (data.defaultModel === 'openai' ? 'OpenAI GPT-4' : 
         data.defaultModel === 'gemini' ? 'Google Gemini' : 'Groq'),
    });
  }
  
  // Handle API keys form submission
  function onApiKeysSubmit(data: ApiKeysFormValues) {
    // Save to server
    saveSettings(data);
    
    toast({
      title: "API Keys updated",
      description: "Your custom API keys have been saved.",
    });
  }
  
  // Save settings to server
  async function saveSettings(data: Partial<ApiKeysFormValues & { defaultAiModel?: string }>) {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Error saving settings: ${response.status}`);
      }
      
      const settings = await response.json();
      console.log("Settings saved:", settings);
      
    } catch (error) {
      console.error("Error saving user settings:", error);
      toast({
        title: "Error saving settings",
        description: "An error occurred while saving your settings. Please try again.",
        variant: "destructive",
      });
    }
  }
  
  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
          
          <Tabs defaultValue="account" className="mt-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="ai-models">AI Models</TabsTrigger>
            </TabsList>
            
            {/* Account Settings */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Profile</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Update your personal information.
                    </p>
                    <Separator className="my-4" />
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                This is your public display name.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                We'll use this email to send you notifications.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit">Save Changes</Button>
                      </form>
                    </Form>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Usage</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Your current usage and limits.
                    </p>
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Animations Remaining</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">You have {user?.generationsRemaining || 0} generations remaining</p>
                        </div>
                        <div className="text-2xl font-bold text-primary-600">{user?.generationsRemaining || 0}/10</div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div 
                          className="bg-primary-600 h-2.5 rounded-full" 
                          style={{ width: `${((10 - (user?.generationsRemaining || 0)) / 10) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="mt-8">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Premium subscription plans with unlimited generations coming soon!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Appearance Settings */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize the appearance of the application.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...appearanceForm}>
                    <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-4">
                      <FormField
                        control={appearanceForm.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a theme" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select a theme for the application.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={appearanceForm.control}
                        name="animations"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Interface Animations
                              </FormLabel>
                              <FormDescription>
                                Enable animations in the user interface.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit">Save Preferences</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* AI Models Settings */}
            <TabsContent value="ai-models">
              <Card>
                <CardHeader>
                  <CardTitle>AI Models</CardTitle>
                  <CardDescription>
                    Configure your AI model preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...aiModelForm}>
                    <form onSubmit={aiModelForm.handleSubmit(onAIModelSubmit)} className="space-y-4">
                      <FormField
                        control={aiModelForm.control}
                        name="defaultModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default AI Model</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a default AI model" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                                <SelectItem value="gemini">Google Gemini</SelectItem>
                                <SelectItem value="groq">Groq</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              This model will be pre-selected when creating new animations.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit">Save Preferences</Button>
                    </form>
                  </Form>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">API Keys</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Add your own API keys to use with the application.
                    </p>
                    <Separator className="my-4" />
                    
                    <Form {...apiKeysForm}>
                      <form onSubmit={apiKeysForm.handleSubmit(onApiKeysSubmit)} className="space-y-4">
                        <FormField
                          control={apiKeysForm.control}
                          name="openaiApiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>OpenAI API Key</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password" 
                                  placeholder="sk-..." 
                                />
                              </FormControl>
                              <FormDescription>
                                Your OpenAI API key for using GPT-4. Starts with "sk-".
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={apiKeysForm.control}
                          name="googleApiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Google AI API Key</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password" 
                                  placeholder="API key for Gemini" 
                                />
                              </FormControl>
                              <FormDescription>
                                Your Google AI API key for using Gemini.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={apiKeysForm.control}
                          name="groqApiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Groq API Key</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password" 
                                  placeholder="gsk_..." 
                                />
                              </FormControl>
                              <FormDescription>
                                Your Groq API key. Starts with "gsk_".
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit">Save API Keys</Button>
                      </form>
                    </Form>
                    
                    <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-300">
                      <p className="font-medium">Important Note</p>
                      <p className="mt-1">
                        Your API keys are stored securely and are only used for generating animations. We never share or use your API keys for any other purpose.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">AI Model Information</h3>
                    <Separator className="my-4" />
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">OpenAI GPT-4</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          GPT-4 offers advanced capabilities in understanding complex prompts and generating high-quality Manim code.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Google Gemini</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Google's Gemini model excels at understanding mathematical concepts and implementing them visually.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Groq</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Groq offers extremely fast response times, which can be beneficial for quick iterations on your animations.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
