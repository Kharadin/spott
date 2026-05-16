"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PricingModal({ isOpen, onClose, trigger = 'limit' }) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const supportEmail = "support@yourdomain.com";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email", err);
    }
  };

  return (
    <>
      {/* Main Pricing Modal */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        {/* 
          [&>button]:scale-[3.5] makes the closing 'X' button massive.
          [&>button_svg]:w-5 [&>button_svg]:h-5 changes the core icon stroke size.
          [&>button]:top-7 [&>button]:right-7 offsets the positioning safely for the giant icon click target.
        */}
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-full sm:max-w-3xl mx-auto [&>button]:text-gray-400 [&>button]:hover:text-gray-900 dark:[&>button]:hover:text-white [&>button]:scale-[3.5] [&>button]:top-10 [&>button]:right-10  max-h-[95vh] overflow-y-auto text-foreground">
          <DialogHeader>
            <div className='flex items-center gap-2 mb-2 pr-8'>
              <Sparkles className="w-6 h-6 text-indigo-500" />
              <DialogTitle className="text-2xl">Ориентировочые Расценки и условия</DialogTitle>
            </div>
            <DialogDescription className="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
              {trigger === 'header' && "Зарегистрируйтесь, чтобы создавать мероприятия. "}
               Мероприятия на нашей платформе посвящены развитию (Мит-апы, ретриты, конференции, тренинги, семинары и другие).
            </DialogDescription>
          </DialogHeader>

          {/* Pricing Grid Table */}
          <div className="my-2 overflow-x-auto border border-gray-200 rounded-xl dark:border-gray-800">
            <table className="w-full text-xs sm:text-sm text-left text-gray-500 dark:text-gray-400 border-collapse">
              <thead className="text-[10px] sm:text-xs text-gray-700  bg-gray-50 dark:bg-gray-800 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th scope="col" className="px-2 sm:px-4 py-3 font-bold text-gray-900 dark:text-white sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">МЕРОПРИЯТИЯ</th>
                  <th scope="col" className="px-2 sm:px-4 py-3 text-center font-semibold whitespace-nowrap">До 50 чел</th>
                  <th scope="col" className="px-2 sm:px-4 py-3 text-center font-semibold whitespace-nowrap">До 100 чел</th>
                  <th scope="col" className="px-2 sm:px-4 py-3 text-center font-semibold whitespace-nowrap">До 500 чел</th>
                  <th scope="col" className="px-2 sm:px-4 py-3 text-center font-semibold whitespace-nowrap">500+ чел</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-800 hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                  <th scope="row" className="px-2 sm:px-4 py-3.5 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Разовые
                  </th>
                  <td className="px-2 sm:px-4 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">$3*</td>
                  <td className="px-2 sm:px-4 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">$10*</td>
                  <td className="px-2 sm:px-4 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">$50*</td>
                  <td onClick={() => setIsEmailModalOpen(true)} className="px-2 sm:px-4 py-3.5 text-center text-[10px] sm:text-xs font-medium text-indigo-500 underline decoration-dotted cursor-pointer whitespace-nowrap">Обращайтесь*</td>
                </tr>
                
                <tr className="bg-indigo-50/40 dark:bg-indigo-950/20 border-b dark:border-gray-800">
                  <td colSpan={5} className="px-2 sm:px-4 py-1.5 font-bold text-[10px] uppercase text-indigo-700 dark:text-indigo-400 tracking-wider">
                    Повторные мероприятия
                  </td>
                </tr>

                <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-800 hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                  <th scope="row" className="px-2 sm:px-4 py-3.5 font-medium text-gray-700 sm:pl-6 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    На 1 неделю
                  </th>
                  <td className="px-2 sm:px-4 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">$14*</td>
                  <td className="px-2 sm:px-4 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">$60*</td>
                  <td className="px-2 sm:px-4 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">$150*</td>
                  <td onClick={() => setIsEmailModalOpen(true)} className="px-2 sm:px-4 py-3.5 text-center text-[10px] sm:text-xs font-medium text-indigo-500 underline decoration-dotted cursor-pointer whitespace-nowrap">Обращайтесь*</td>
                </tr>

                <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-800 hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                  <th scope="row" className="px-2 sm:px-4 py-3.5 font-medium text-gray-700 sm:pl-6 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    На 2 недели
                  </th>
                  <td className="px-2 sm:px-4 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">$20*</td>
                  <td className="px-2 sm:px-4 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">$90*</td>
                  <td className="px-2 sm:px-4 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">$220*</td>
                  <td onClick={() => setIsEmailModalOpen(true)} className="px-2 sm:px-4 py-3.5 text-center text-[10px] sm:text-xs font-medium text-indigo-500 underline decoration-dotted cursor-pointer whitespace-nowrap">Обращайтесь*</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <p>
              <span className="font-bold text-gray-800 dark:text-gray-200">* Особые случаи И крупные события:</span>{" "}
              Обращайтесь. Мы можем найти взаимовыгодные решения.
            </p>
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
            <p>
              <span className="font-bold text-gray-800 dark:text-gray-200">РАЗМЕЩЕНИЕ РЕКЛАМЫ:</span>{" "}
              Связитесь с нами для индивидуальных рекламных предложений.
            </p>
          </div>

          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Может позже
            </Button>
            <Button 
              onClick={() => setIsEmailModalOpen(true)} 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
            >
              Написать Админу
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Explicit Support Email Sub-Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        {/* Same macro scale factor rules aчелy here for layout consistency across overlays */}
        <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-xl p-6 [&>button]:text-gray-400 [&>button]:hover:text-gray-900 dark:[&>button]:hover:text-white [&>button]:scale-[3.5] [&>button_svg]:w-3 [&>button_svg]:h-3 [&>button]:top-7 [&>button]:right-9">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-2">
              <Mail className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl text-center">Написать Админу</DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-500 dark:text-gray-400">
              Контакты для объявлений о меропрятиях и размещения рекламы
            </DialogDescription>
          </DialogHeader>

          {/* Email Box Area */}
          <div className="flex items-center justify-between gap-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg mt-2 select-all">
            <span className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
              {supportEmail}
            </span>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleCopyEmail} 
              className="h-8 w-8 shrink-0 text-gray-500 hover:text-gray-900 dark:hover:text-white" 
              title="Скопировать почту"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex flex-col gap-3 mt-6 w-full">
            <a 
              href={`mailto:${supportEmail}?subject=Event%20Pricing%20Inquiry`} 
              className="w-full"
            >
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
                Открыть почту
              </Button>
            </a>
            
            <Button 
              variant="outline" 
              onClick={() => setIsEmailModalOpen(false)} 
              className="w-full text-sm text-foreground"
            >
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
