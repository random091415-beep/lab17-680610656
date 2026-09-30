import { z } from "zod";

import type { Course } from "@/lib/types";

export const MAX_EMAILS = 3;

export const courseFormSchema = z.object({
  courseId: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "รหัสวิชาต้องเป็นตัวเลข 6 หลัก"),
  courseTitle: z
    .string()
    .trim()
    .min(1, "กรอกชื่อวิชา")
    .max(100, "ชื่อวิชายาวได้ไม่เกิน 100 ตัวอักษร"),

  program: z.enum(["CPE", "ISNE"], { message: "เลือกหลักสูตร" }),
  semester: z.enum(["1", "2", "3"], { message: "เลือกภาคการศึกษา" }),
  //   // Checkbox หลายตัว → array ของ id
  //   interests: z
  //     .array(z.string())
  //     .min(1, "เลือกความสนใจอย่างน้อย 1 ด้าน")
  //     .max(MAX_INTERESTS, `เลือกได้ไม่เกิน ${MAX_INTERESTS} ด้าน`),
  // Array Fields (useFieldArray) — array ของ object เพื่อให้แต่ละแถวมี field.id เป็น key

  instructors: z
    .array(
      z.object({
        name: z.string().trim().min(1, "กรอกชื่อผู้สอน"),
        email: z
          .email("อีเมลไม่ถูกต้อง")
          .refine((val) => val.endsWith("@cmu.ac.th"), {
            message: "ต้องเป็นอีเมล @cmu.ac.th",
          }), // ← ตรวจทีละแถว
      }),
    )
    // ─── Array Validation: ตรวจทั้งรายการ ───
    .min(1, "ต้องมีอีเมลอย่างน้อย 1 อีเมล")
    .max(MAX_EMAILS, `มีอีเมลได้ไม่เกิน ${MAX_EMAILS} อีเมล`)
    .refine(
      (items) =>
        new Set(items.map((i) => i.email.toLowerCase())).size === items.length,
      "อีเมลซ้ำกัน",
    ),

  description: z
    .string()
    .max(100, "รายละเอียดยาวได้ไม่เกิน 100 ตัวอักษร")
    .optional(),

  notifyByEmail: z.boolean(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

/**
 * กันรหัสซ้ำด้วย .refine()
 * ต้องสร้าง "ข้างใน" component (ผ่าน useMemo) เพราะต้องรู้ students ล่าสุดจาก store
 */
export function createCourseFormSchema(existingCourses: Course[]) {
  return courseFormSchema.refine(
    (data) => !existingCourses.some((s) => s.courseId === data.courseId),
    { message: "รหัสวิชานี้มีอยู่แล้ว", path: ["courseId"] },
  );
}
