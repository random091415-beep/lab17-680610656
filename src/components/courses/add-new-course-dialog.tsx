import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, X, RotateCcw, Plus } from "lucide-react";

import {
  Controller,
  useFieldArray,
  useForm,
  type DefaultValues,
} from "react-hook-form";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "../ui/label";
import { Input } from "@/components/ui/input";

import {
  createCourseFormSchema,
  type CourseFormValues,
  MAX_EMAILS,
} from "@/lib/schemas/course-schema";

import { useEnrollmentStore } from "@/lib/enrollment-store";
/**
 *   (Lab 17): เขียนฟอร์มนี้ใหม่ด้วย Zod + React Hook Form
 *   (ดูตัวอย่างใน components/students/add-new-student-dialog.tsx)
 *   - schema ใหม่ที่ src/lib/schemas/course-schema.ts (แทน course-validation.ts)
 *   - ผู้สอนเป็น Array Fields (useFieldArray) — ชื่อ + อีเมล @cmu.ac.th, 1–3 คน
 *   - หลักสูตร (Select), ภาคการศึกษา (Radio Group), รายละเอียด (Textarea 0/100),
 *     รับข่าวสารทางอีเมล (Switch)
 */
export function AddNewCourseDialog() {
  const programOptions = [
    { value: "CPE", label: "CPE — วิศวกรรมคอมพิวเตอร์" },
    { value: "ISNE", label: "ISNE — วิศวกรรมระบบสารสนเทศและเครือข่าย" },
  ];

  const emptyCourseForm: DefaultValues<CourseFormValues> = {
    courseId: "",
    courseTitle: "",
    program: undefined,
    instructors: [{ name: "", email: "" }],
    semester: undefined,
    notifyByEmail: false,
    description: "",
  };

  const addCourse = useEnrollmentStore((s) => s.addCourse);
  const courses = useEnrollmentStore((s) => s.courses);
  const [open, setOpen] = useState(false);

  // state ที่ต้องถือเองสามก้อน (Zod + React Hook Form จะรวมเป็น useForm ตัวเดียว)
  // const [values, setValues] = useState<CourseFormValues>(emptyCourseForm);
  // const [errors, setErrors] = useState<CourseFormErrors>({});
  // const [touched, setTouched] = useState<
  //   Partial<Record<keyof CourseFormValues, boolean>>
  // >({});

  const schema = useMemo(() => createCourseFormSchema(courses), [courses]);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyCourseForm,
    mode: "onBlur",
  });

  // const [instructorInput, setInstructorInput] = useState("");
  // const instructorsAnchor = useComboboxAnchor();

  // const knownInstructors = [...new Set(courses.flatMap((c) => c.instructors))];
  // const typedInstructor = instructorInput.trim();
  // const isNewInstructor =
  //   typedInstructor.length > 0 &&
  //   !knownInstructors.some(
  //     (name) => name.toLowerCase() === typedInstructor.toLowerCase(),
  //   ) &&
  //   !values.instructors.includes(typedInstructor);
  // const instructorItems = [
  //   ...knownInstructors,
  //   ...values.instructors.filter((name) => !knownInstructors.includes(name)),
  //   ...(isNewInstructor ? [typedInstructor] : []),
  // ];

  // const checkField = (name: keyof CourseFormValues, next: CourseFormValues) => {
  //   setErrors((prev) => ({
  //     ...prev,
  //     [name]: validateCourseField(name, next, courses),
  //   }));
  // };

  // const handleChange = <K extends keyof CourseFormValues>(
  //   name: K,
  //   value: CourseFormValues[K],
  // ) => {
  //   const next = { ...values, [name]: value };
  //   setValues(next);
  //   // ช่องที่เคยออกไปแล้ว (touched) เช็กใหม่ทันทีตอนแก้ — error หายเมื่อแก้ถูก
  //   if (touched[name]) checkField(name, next);
  // };

  // // เทียบได้กับ mode: "onBlur" ของ React Hook Form
  // const handleBlur = (name: keyof CourseFormValues) => {
  //   setTouched((prev) => ({ ...prev, [name]: true }));
  //   checkField(name, values);
  // };

  // const resetForm = () => {
  //   setValues(emptyCourseForm);
  //   setErrors({});
  //   setTouched({});
  //   setInstructorInput("");
  // };

  // // ด่านตรวจก่อนเข้า store — เทียบได้กับ form.handleSubmit(onSubmit)
  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   const nextErrors = validateCourseForm(values, courses);
  //   setErrors(nextErrors);
  //   setTouched({ courseId: true, courseTitle: true, instructors: true });
  //   if (Object.keys(nextErrors).length > 0) return; // ไม่ผ่าน → ไม่เรียก addCourse

  //   addCourse({
  //     courseId: values.courseId.trim(),
  //     courseTitle: values.courseTitle.trim(),
  //     instructors: values.instructors,
  //   });
  //   resetForm();
  //   setOpen(false);
  // };
  // ─── useFieldArray ───
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "instructors",
  });

  const emailsError =
    form.formState.errors.instructors?.root ??
    form.formState.errors.instructors;

  const resetForm = () => form.reset(emptyCourseForm);

  // ถึงจุดนี้แปลว่า Zod validate ผ่านแล้วทุก field (ค่าถูก trim แล้วด้วย)
  function onSubmit(values: CourseFormValues) {
    addCourse(values);
    resetForm();
    setOpen(false);
  }

  // // ต้องต่อ id / aria-* / ข้อความ error เองทุกช่อง (<FormItem/FormControl/FormMessage> จะทำแทน)
  // const errorOf = (name: keyof CourseFormValues) =>
  //   touched[name] ? errors[name] : undefined;

  // const invalidProps = (name: keyof CourseFormValues) => ({
  //   "aria-invalid": errorOf(name) ? true : undefined,
  //   "aria-describedby": errorOf(name) ? `${name}-error` : undefined,
  // });

  // const fieldError = (name: keyof CourseFormValues) => {
  //   const message = errorOf(name);
  //   return message ? (
  //     <p id={`${name}-error`} className="text-sm text-destructive">
  //       {message}
  //     </p>
  //   ) : null;
  // };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // ปิด popup แล้วล้างค่า/error — เปิดใหม่ต้องได้ฟอร์มว่าง
        if (!next) resetForm();
      }}>
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="grid gap-4">
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              ลองใส่รหัสวิชาไม่ครบ 6 หลัก ใส่รหัสที่มีอยู่แล้ว
              ใส่อีเมลผู้สอนที่ไม่ใช่ @cmu.ac.th หรือพิมพ์รายละเอียดเกิน 100
              ตัวอักษร แล้วกดบันทึก
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <div>
                <Controller
                  name="courseId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="courseId">รหัสวิชา</FieldLabel>
                      <Input
                        {...field}
                        id="courseId"
                        placeholder="เช่น 261305"
                        inputMode="numeric"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div>
                <Controller
                  name="courseTitle"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="courseTitle">ชื่อวิชา</FieldLabel>
                      <Input
                        {...field}
                        id="courseTitle"
                        placeholder="เช่น Mobile Application Development"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>

            <Controller
              name="program"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="program">หลักสูตร</FieldLabel>
                  <Select
                    name={field.name}
                    items={programOptions}
                    value={field.value ?? null}
                    onValueChange={(v) => {
                      field.onChange(v);
                      field.onBlur();
                    }}>
                    <SelectTrigger
                      id="program"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                      ref={field.ref}>
                      <SelectValue placeholder="เลือกหลักสูตร" />
                    </SelectTrigger>
                    <SelectContent>
                      {programOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="semester"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="semester">ภาคการศึกษา</FieldLabel>

                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-row gap-6">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="1" id="r1" />
                      <Label htmlFor="r1">ภาคการศึกษาที่ 1</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="2" id="r2" />
                      <Label htmlFor="r2">ภาคการศึกษาที่ 2</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="3" id="r3" />
                      <Label htmlFor="r3">ภาคฤดูร้อน</Label>
                    </div>
                  </RadioGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => {
                const length = field.value?.length ?? 0;
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="description">
                      รายละเอียด (ไม่บังคับ)
                    </FieldLabel>
                    <Textarea
                      id="description"
                      placeholder="คำอธิบายรายวิชาสั้นๆ"
                      {...field}
                    />
                    {length}/100 ตัวอักษร
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
            />

            <FieldSet data-invalid={!!emailsError?.message}>
              <FieldLegend variant="label">ผู้สอน</FieldLegend>
              <FieldDescription>
                {fields.length}/{MAX_EMAILS} คน — กรอกชื่อผู้สอน และอีเมล
                name@cmu.ac.th (ห้ามซ้ำกัน)
              </FieldDescription>

              <FieldGroup className="gap-3">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <span className="mt-1.5 w-5 shrink-0 text-sm text-muted-foreground">
                      {index + 1}.
                    </span>

                    {/* Name */}
                    <Controller
                      name={`instructors.${index}.name`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div className="flex-1 flex flex-col gap-0.5">
                          <Input
                            {...field}
                            id={`name-${index}`}
                            type="text"
                            placeholder="ชื่อผู้สอน"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </div>
                      )}
                    />

                    {/* Email */}
                    <Controller
                      name={`instructors.${index}.email`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div className="flex-1 flex flex-col gap-0.5">
                          <Input
                            {...field}
                            id={`email-${index}`}
                            type="email"
                            placeholder="name@cmu.ac.th"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </div>
                      )}
                    />

                    {/* Remove button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`ลบผู้สอนที่ ${index + 1}`}
                      disabled={fields.length <= 1}
                      onClick={() => remove(index)}>
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </FieldGroup>

              {/* ─── Array Validation: error ระดับ array ─── */}
              {emailsError?.message && <FieldError errors={[emailsError]} />}

              {/* ─── append({...}) ─── */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                disabled={fields.length >= MAX_EMAILS}
                onClick={() => append({ name: "", email: "" })}>
                <Plus className="size-4" />
                เพิ่มผู้สอน
              </Button>
            </FieldSet>

            <Controller
              name="notifyByEmail"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="notifyByEmail">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>รับข่าวสารทางอีเมล</FieldTitle>
                        <FieldDescription>
                          แจ้งเตือนผู้สอนเมื่อเปิดลงทะเบียน
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id="notifyByEmail"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  </FieldLabel>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            {/* ล้างฟอร์ม — กลับเป็นค่าเริ่มต้น + ล้าง error โดยไม่ปิด popup */}
            <Button type="button" variant="outline" onClick={resetForm}>
              <RotateCcw className="h-4 w-4" />
              ล้างฟอร์ม
            </Button>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
