import { ConfirmDeleteButton } from "@/components/confirm-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import { Badge } from "../ui/badge";

export function CourseTable() {
  const courses = useEnrollmentStore((s) => s.courses);
  const removeCourse = useEnrollmentStore((s) => s.removeCourse);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัสวิชา</TableHead>
            <TableHead>ชื่อวิชา</TableHead>
            <TableHead>หลักสูตร</TableHead>
            <TableHead>ภาคการศึกษา</TableHead>
            <TableHead>รายละเอียด</TableHead>
            <TableHead>ผู้สอน</TableHead>
            <TableHead>รับข่าวสารทางอีเมล</TableHead>
            <TableHead className="w-20">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-20 text-center text-muted-foreground">
                ยังไม่มีวิชาที่เปิดสอน
              </TableCell>
            </TableRow>
          )}
          {courses.map((course) => (
            <TableRow key={course.courseId}>
              <TableCell>{course.courseId}</TableCell>
              <TableCell>{course.courseTitle}</TableCell>
              <TableCell>
                <Badge variant="outline">{course.program}</Badge>
              </TableCell>
              <TableCell>
                {{
                  "1": "ภาคการศึกษาที่ 1",
                  "2": "ภาคการศึกษาที่ 2",
                  "3": "ภาคฤดูร้อน",
                }[String(course?.semester)] || "-"}
              </TableCell>
              <TableCell className="max-w-[200px] break-words whitespace-normal">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    {course.description || "-"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {course.instructors.length === 0 ? (
                  <span className="text-muted-foreground">ยังไม่มีผู้สอน</span>
                ) : (
                  course.instructors.map((inst) => (
                    <div key={inst.email} className="flex flex-col">
                      <span>{inst.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {inst.email}
                      </span>
                    </div>
                  ))
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={` font-bold border-transparent ${
                    course.notifyByEmail
                      ? "bg-[#e5e5e5] text-black"
                      : "bg-[#262626] text-white"
                  }`}>
                  {!course.notifyByEmail ? "ไม่รับ" : "รับ"}
                </Badge>
              </TableCell>
              <TableCell>
                <ConfirmDeleteButton
                  label={`ลบวิชา ${course.courseId}`}
                  title="ลบวิชา?"
                  description={`ลบ ${course.courseId} — ${course.courseTitle} ออกจากรายวิชาที่เปิดสอน พร้อมการลงทะเบียนทั้งหมดของวิชานี้`}
                  onConfirm={() => removeCourse(course.courseId)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
