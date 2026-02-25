import { CheckCircle, Star, Bug, Plus, Minus } from "lucide-react";

import { Badge } from "@shared/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@shared/ui/components/dialog";
import { ScrollArea } from "@shared/ui/components/scroll-area";


interface VersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VersionDialog = ({ open, onOpenChange }: VersionDialogProps) => {
  const changelog = [
    {
      version: "1.4.0",
      date: "2025-02-25",
      type: "current",
      changes: [
        { type: "feature", text: "لوحة تحكم محسنة مع إحصائيات الموظفين (الإجمالي، النشطين، في إجازة)" },
        { type: "feature", text: "عرض حالة المستندات والتأمين مع أشرطة تقدم ملونة" },
        { type: "feature", text: "قائمة أفضل المبيعات لأعلى 3 موظفين" },
        { type: "improvement", text: "توحيد تنسيق الأرقام إلى الإنجليزية في جميع أنحاء المسار" },
        { type: "improvement", text: "شريط تنقل سفلي محدث مع 3 عناصر (الرئيسية، الموظفين، المستندات)" },
        { type: "improvement", text: "تحسين التحميل مع هيكل عظمي للإحصائيات" },
      ]
    },
    {
      version: "1.3.0",
      date: "2024-01-20",
      type: "previous",
      changes: [
        { type: "simplification", text: "تبسيط لوحة التحكم الرئيسية لتحسين تجربة المستخدم" },
        { type: "simplification", text: "إزالة البطاقات الإحصائية المعقدة والاحتفاظ بالبساطة" },
        { type: "simplification", text: "إزالة الإجراءات السريعة المعقدة" },
        { type: "simplification", text: "إزالة قسم النشاطات الأخيرة" },
        { type: "improvement", text: "نقل قائمة التنقل إلى أسفل الشاشة في جميع الصفحات عدا الرئيسية" },
        { type: "improvement", text: "تحسين التنقل بتصميم شريط سفلي ثابت" },
        { type: "feature", text: "الاحتفاظ بالتذييل في لوحة التحكم الرئيسية فقط" },
      ]
    },
    {
      version: "1.2.0",
      date: "2024-01-15",
      type: "previous",
      changes: [
        { type: "feature", text: "تحسين لوحة التحكم الرئيسية مع تصميم جديد" },
        { type: "feature", text: "إضافة السحب للتحديث (Pull-to-refresh)" },
        { type: "improvement", text: "تحسين التصميم المتجاوب للهواتف المحمولة" },
        { type: "improvement", text: "تحسين دعم اللغة العربية والـ RTL" },
        { type: "feature", text: "إضافة رسوم بيانية صغيرة في بطاقات الإحصائيات" },
        { type: "improvement", text: "تحسين الألوان والتدرجات" },
      ]
    },
    {
      version: "1.1.0",
      date: "2024-01-01",
      type: "previous",
      changes: [
        { type: "feature", text: "إضافة نظام إدارة الموظفين الشامل" },
        { type: "feature", text: "تحسين نظام المصروفات مع فئات جديدة" },
        { type: "feature", text: "إضافة منتقي الشهر لعرض البيانات التاريخية" },
        { type: "improvement", text: "تحسين كشوف المرتبات مع تفاصيل أكثر" },
        { type: "fix", text: "إصلاح مشاكل حساب الضرائب" },
      ]
    },
    {
      version: "1.0.0",
      date: "2023-12-15",
      type: "previous",
      changes: [
        { type: "feature", text: "إطلاق النظام الأساسي" },
        { type: "feature", text: "نظام تسجيل الدخول الآمن" },
        { type: "feature", text: "إدارة الفروع والمدراء" },
        { type: "feature", text: "نظام المبيعات اليومية" },
        { type: "feature", text: "التقارير الأساسية" },
      ]
    }
  ];

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Plus className="h-4 w-4 text-emerald-600" />;
      case "improvement":
        return <Star className="h-4 w-4 text-slate-600" />;
      case "fix":
        return <Bug className="h-4 w-4 text-amber-600" />;
      case "simplification":
        return <Minus className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "improvement":
        return "text-slate-700 bg-slate-50 border-slate-200";
      case "fix":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "simplification":
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getChangeLabel = (type: string) => {
    switch (type) {
      case "feature":
        return "ميزة جديدة";
      case "improvement":
        return "تحسين";
      case "fix":
        return "إصلاح";
      case "simplification":
        return "تبسيط";
      default:
        return "تغيير";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] border-gray-200" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-['Changa'] text-xl text-center text-gray-800">
            سجل التغييرات والتحديثات
          </DialogTitle>
          <DialogDescription className="sr-only">
            عرض سجل التحديثات والتغييرات للإصدارات السابقة.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] ps-4">
          <div className="space-y-6">
            {changelog.map((version) => (
              <div key={version.version} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex flex-row items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    {version.date}
                  </span>
                  <div className="flex flex-row-reverse items-center gap-3">
                    {version.type === "current" && (
                      <Badge className="bg-gray-800 text-white hover:bg-gray-700">
                        النسخة الحالية
                      </Badge>
                    )}
                    <h3 className="text-lg font-bold font-['Changa'] text-gray-800">
                      النسخة {version.version}
                    </h3>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {version.changes.map((change, index) => (
                    <div
                      key={index}
                      className={`flex flex-row-reverse items-start gap-3 p-3 rounded-lg border ${getChangeColor(change.type)}`}
                    >
                      <div className="flex-1 text-end">
                        <div className="flex flex-row-reverse items-center justify-end gap-2 mb-1">
                          <Badge variant="outline" className="text-xs border-gray-300">
                            {getChangeLabel(change.type)}
                          </Badge>
                        </div>
                        <p className="text-sm font-['Changa']">
                          {change.text}
                        </p>
                      </div>
                      {getChangeIcon(change.type)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 font-['Changa']">
            شكراً لاستخدامكم نظام إدارة الفروع
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
