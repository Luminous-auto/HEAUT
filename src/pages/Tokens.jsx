
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Coins, Loader2, ChevronDown, ChevronUp, Calendar, CreditCard, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const TokenPackage = ({ amount, price, popular, onSelect }) => (
  <button
    onClick={onSelect}
    className={`relative p-6 rounded-lg border-2 transition-all hover:scale-105 ${
      popular 
        ? 'border-stone-900 bg-stone-50' 
        : 'border-stone-200 bg-white hover:border-stone-400'
    }`}
  >
    {popular && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-stone-900 text-white px-3 py-1 rounded-full text-xs font-medium">
          Popular
        </span>
      </div>
    )}
    <div className="flex items-center justify-center mb-3">
      <Coins className="w-8 h-8 text-stone-600" strokeWidth={1.5} />
    </div>
    <div className="text-3xl font-bold text-stone-900 mb-1">
      {amount}
    </div>
    <div className="text-sm text-stone-500 mb-3">tokens</div>
    <div className="text-2xl font-semibold text-stone-900">
      ${price}
    </div>
  </button>
);

const PaymentMethod = ({ icon: Icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full p-4 rounded-lg border border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition-all text-left"
  >
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-stone-600" strokeWidth={1.5} />
      </div>
      <div>
        <h4 className="font-semibold text-stone-900 mb-1">{title}</h4>
        <p className="text-sm text-stone-600">{description}</p>
      </div>
    </div>
  </button>
);

export default function TokensPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['tokenTransactions', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.TokenTransaction.filter({ created_by: user.email }, '-date');
    },
    initialData: [],
    enabled: !!user?.email,
  });

  const tokenBalance = user?.tokens || 0;

  const tokenPackages = [
    { amount: 10, price: 4.99 },
    { amount: 25, price: 9.99, popular: true },
    { amount: 50, price: 17.99 },
    { amount: 100, price: 29.99 },
  ];

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setShowPaymentMethods(true);
  };

  const handlePayment = (method) => {
    // In production, this would integrate with payment gateways
    alert(`Payment processing with ${method} is not yet implemented. This would integrate with payment providers like Stripe, PayPal, or crypto wallets.`);
    setPurchaseDialogOpen(false);
    setShowPaymentMethods(false);
    setSelectedPackage(null);
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-2">
            Your Tokens
          </h1>
          <p className="text-stone-600">
            Earn rewards for your journaling practice.
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="lg:col-span-1 cursor-pointer hover:border-stone-400 transition-colors"
            onClick={() => setShowHistory(!showHistory)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-stone-900">
                <Coins className="w-5 h-5 text-stone-500" strokeWidth={1.5} />
                Current Balance
                {showHistory ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="w-10 h-10 animate-spin text-stone-400" />
              ) : (
                <>
                  <div className="text-6xl font-bold text-stone-900 mb-4">
                    {tokenBalance}
                  </div>
                  <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-stone-900 hover:bg-stone-800">
                        <CreditCard className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Purchase More Tokens
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Purchase Tokens</DialogTitle>
                        <DialogDescription>
                          Choose a token package and select your payment method
                        </DialogDescription>
                      </DialogHeader>

                      {!showPaymentMethods ? (
                        <div className="py-6">
                          <h3 className="text-lg font-semibold text-stone-900 mb-4">
                            Select Token Package
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {tokenPackages.map((pkg) => (
                              <TokenPackage
                                key={pkg.amount}
                                amount={pkg.amount}
                                price={pkg.price}
                                popular={pkg.popular}
                                onSelect={() => handleSelectPackage(pkg)}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-6">
                          <div className="bg-stone-50 p-4 rounded-lg mb-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-stone-600">Selected Package</p>
                                <p className="text-2xl font-bold text-stone-900">
                                  {selectedPackage.amount} tokens
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-stone-600">Total</p>
                                <p className="text-2xl font-bold text-stone-900">
                                  ${selectedPackage.price}
                                </p>
                              </div>
                            </div>
                          </div>

                          <h3 className="text-lg font-semibold text-stone-900 mb-4">
                            Choose Payment Method
                          </h3>
                          <div className="space-y-3">
                            <PaymentMethod
                              icon={CreditCard}
                              title="Credit/Debit Card"
                              description="Pay securely with Visa, Mastercard, or American Express"
                              onClick={() => handlePayment('Credit Card')}
                            />
                            <PaymentMethod
                              icon={Wallet}
                              title="PayPal"
                              description="Fast and secure payment through your PayPal account"
                              onClick={() => handlePayment('PayPal')}
                            />
                            <PaymentMethod
                              icon={Coins}
                              title="Cryptocurrency"
                              description="Pay with Bitcoin, Ethereum, or other cryptocurrencies"
                              onClick={() => handlePayment('Cryptocurrency')}
                            />
                          </div>

                          <Button
                            variant="outline"
                            className="w-full mt-6"
                            onClick={() => {
                              setShowPaymentMethods(false);
                              setSelectedPackage(null);
                            }}
                          >
                            Back to Packages
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </>
              )}
              <p className="text-sm text-stone-500 mt-2">Click to view history</p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
             <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>A simple system to encourage reflection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-stone-700">
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-stone-600">1</span>
                    </div>
                    <p>Write a new entry in your journal about anything on your mind.</p>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-stone-600">2</span>
                    </div>
                    <p>Click "Save & Analyze" to get thoughtful feedback from your AI Companion.</p>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-stone-600">3</span>
                    </div>
                    <p>You'll automatically earn <span className="font-semibold">2 tokens</span> for every entry you analyze. Keep writing, keep growing!</p>
                </div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                    Transaction History
                  </CardTitle>
                  <CardDescription>
                    A record of all your token earnings and spending
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTransactions ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-stone-500">
                      <p>No transactions yet. Start journaling to earn your first tokens!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-stone-900">
                              {transaction.description || transaction.type.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-stone-500">
                              {format(new Date(transaction.date), 'PPp')}
                            </p>
                          </div>
                          <div className={`text-xl font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
