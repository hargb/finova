import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import React from "react";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

export default async function AddTransactionPage({ searchParams }) {
  let accounts = [];
  let initialData = null;
  
  try {
    accounts = await getUserAccounts();
  } catch (error) {
    console.error("❌ Error fetching user accounts:", error);
  }

  const editId = searchParams?.edit;
  if (editId) {
    try {
      initialData = await getTransaction(editId);
    } catch (error) {
      console.error("❌ Error fetching transaction:", error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8">
      <div className="flex justify-center  md:justify-normal mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">{editId ? "Edit" : "Add"} Transaction</h1>
      </div>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}
