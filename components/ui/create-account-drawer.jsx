"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";

import { Loader2 } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";

export function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);
  
  const {
    control, 
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: 0.00,
      isDefault: false,
    },
  });

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    error,
    data: newAccount,
  } = useFetch(createAccount);

  // 🔍 Debugging API Call Response
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      if (newAccount) console.log("🆕 New Account Response:", newAccount);
      if (error) console.error("❌ API Error:", error);
    }
  }, [newAccount, error]);
  
  
  
  

  // 🔍 Debugging Form Validation
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.warn("⚠️ Form Validation Errors:", errors);
    }
  }, [errors]);

  const onSubmit = async (data) => {
    console.log("🚀 Submitting Data:", data);

    // Ensure balance is a valid number
    const balance = parseFloat(data.balance);
    if (isNaN(balance) || balance < 0) {
      console.error("❌ Invalid Balance:", data.balance);
      toast.error("Balance must be a valid positive number.");
      return;
    }

    const requestData = { ...data, balance };
    console.log("📡 Sending API Request with:", requestData);

    try {
      const response = await createAccountFn(requestData);
      
      if (!response) {
        console.error("❌ API returned undefined or null.");
        toast.error("Something went wrong. Please try again.");
        return;
      }

      console.log("✅ API Response:", response);
      toast.success("Account created successfully");

      reset(); // Clear form
      setTimeout(() => setOpen(false), 150); // Smooth closing
    } catch (error) {
      console.error("❌ API Call Failed:", error);
      toast.error(error.message || "Failed to create account");
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Account Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Account Name
              </label>
              <Input id="name" placeholder="e.g., Main Checking" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Account Type Select */}
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Account Type
              </label>
              <Select value={watch("type")} onValueChange={(value) => setValue("type", value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type"  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            </div>

            {/* Initial Balance Input */}
            <div className="space-y-2">
              <label htmlFor="balance" className="text-sm font-medium">
                Initial Balance
              </label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance",{valueAsNumber: true,min:0,required: "Balance is required"})}
              />
              {errors.balance && <p className="text-sm text-red-500">{errors.balance.message}</p>}
            </div>

            {/* Default Account Switch */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <label htmlFor="isDefault" className="text-base font-medium cursor-pointer">
                  Set as Default
                </label>
                <p className="text-sm text-muted-foreground">
                  This account will be selected by default for transactions.
                </p>
              </div>
              <Controller
  name="isDefault"
  control={control}
  render={({ field:{value,onChange} }) => (
    <Switch id="isDefault" checked={value} onCheckedChange={onChange} />
  )}
/>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button type="submit" className="flex-1" disabled={createAccountLoading}>
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
