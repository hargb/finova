import { getUserAccounts } from "@/actions/dashboard";
import { getTransaction } from "@/actions/transaction";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";

export default async function AddTransactionPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const editId = resolvedSearchParams?.edit;

  let accounts = [];
  let initialData = null;

  try {
    accounts = (await getUserAccounts()) ?? [];
  } catch (error) {
    console.error("Error fetching user accounts:", error);
  }

  if (editId) {
    try {
      initialData = await getTransaction(editId);
    } catch (error) {
      console.error("Error fetching transaction:", error);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 md:px-8">
      <div className="mb-8 flex justify-center md:justify-start">
        <h1 className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-4xl font-bold text-transparent">
          {editId ? "Edit" : "Add"} Transaction
        </h1>
      </div>

      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={Boolean(editId)}
        initialData={initialData}
      />
    </div>
  );
}