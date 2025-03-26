import React,{Suspense} from 'react'
import {getAccountWithTransactions} from "@/actions/accounts";
import TransactionTable from "../_components/transaction-table"
import {notFound} from "next/navigation"
import BarLoader from "react-spinners/BarLoader";
import AccountChart from "../_components/account-chart";


const Accountspage = async({params}) => {
  if (!params || !params.id) {
    notFound();
  }
  const accountData = await getAccountWithTransactions(params.id);
  
 
  if(!accountData){
    notFound();
  }
  const transactions = accountData.transactions || [];
  const { ...account } = accountData;
  
  return (
    <div className="space-y-8 px-5 ">
      <div className="flex gap-4 items-end justify-between">
     <div>
      <h1 className="text-5xl sm:text-6xl font-bold  gradient-title capitalize">{account.name}</h1>
      <p className="text-muted-foreground">
  {account.type ? account.type.charAt(0) + account.type.slice(1).toLowerCase() : "Unknown"} Account
</p>

     </div>
     <div className="text-right pb-2">
      <div className="text-xl sm:text-2xl font-bold">₹{parseFloat(account.balance).toFixed(2)}</div>
      <p className="text-sm text-muted-foreground">{account._count.transactions ?? 0} Transactions</p>
     </div>
     </div>
     {/* chart Section*/}

<Suspense fallback={<BarLoader className="mt-4 " width={"100%"} color="#9333ea"/>}>
<AccountChart transactions={transactions}/>
</Suspense>
     {/* Transaction Table*/}
     <TransactionTable transactions={transactions} />

   
   
    </div>
  )
}

export default Accountspage
