"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function MoreInfoModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* 
         styles:
         - z-[60]: Ensures this modal sits ON TOP of the PricingModal (which is usually z-50).
         - [&>button]:scale-[3.5]: Matches your giant 'X' button style.
      */}
      <DialogContent className="z-[60] w-[calc(100%-1.5rem)] max-w-full sm:max-w-3xl mx-auto [&>button]:text-gray-400 [&>button]:hover:text-gray-900 dark:[&>button]:hover:text-white [&>button]:scale-[3.5] [&>button]:top-10 [&>button]:right-10 max-h-[95vh] overflow-y-auto text-foreground">
        
        <DialogHeader>
          <div className='flex items-center gap-2 mb-2 pr-8'>
            <Sparkles className="w-6 h-6 text-indigo-500" />
            <DialogTitle className="text-2xl">
              Концепция сайта
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* CONTENT AREA: You can type your details here */}
        <div className="mt-4 space-y-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          <p>
            Сайт посвящен мероприятиям, направленным на развитие: личностное, профессиональное, духовное и т.д. Автор сайта - Харадин, в прошлой жизни - Джек Парсонс, эзотерик и инженер-изобретатель, один из основателей Jet Propulsion Laboratory (JPL) и американской космической программы. Однако в этой жизни он решил посвятить себя помощи людям в их развитии.  Мы стремимся создать платформу, где люди могут обмениваться знаниями, опытом и вдохновением для личного роста.
          </p>
          
          {/* Example List Structure */}
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-semibold text-gray-900 dark:text-white">Без надоедливой рекламы:</span> Только выбранные вручную, близкие по темам интеграции; для VIP возможно полное отключение.</li>
            <li><span className="font-semibold text-gray-900 dark:text-white">Без информационного мусора  :</span> Платформа свободна от бытовых мелочей и неуместных предложений Мы исключили любой контент, который создает визуальный шум и не соответствует духу развития.</li>
            <li><span className="font-semibold text-gray-900 dark:text-white">Направленность: </span> Мероприятия могут быть разного уровня: от мастер-класса по хендмейд до духовного ретрита, однако мы стремимся обеспечить чтобы все они способствовали росту, свободе и самореализации.</li>
            <li><span className="font-semibold text-gray-900 dark:text-white">Дельность:</span> Если это мастер-класс по хендмейд, то навыки способствуют самодостаточности, если малоизвестный мастер- то стремимся удостовериться, что он несёт реальные ценные навыки, даже если в чём-то с ним несогласны.</li>
         {/* 3. ANAHATA (With Link) */}
            <li>
            <a 
                href="https://www.oum.ru/yoga/osnovy-yogi/anakhata-chakra/" 
                target="_blank" 
                rel="noopener noreferrer"
              
                title="Подробнее про Анахату"
                className="text-indigo-700 hover:text-indigo-500 hover:underline dark:text-indigo-400          dark:hover:text-indigo-300  cursor-pointer font-semibold"
             >   
                Анахата:{" "}
            </a>
            Организаторам в проведении мероприятий следует хотя бы стремиться к уровню сердечной чакры, т.е. приятию, непривязанности, развитию в себе и окружающих душевного понимания других
            </li>
          </ul>
        </div>

        <div className="mt-8 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
