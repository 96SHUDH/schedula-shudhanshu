-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientProfileId" TEXT NOT NULL,
    "recurringAvailabilityId" TEXT,
    "customAvailabilityId" TEXT,
    "schedulingType" "SchedulingType" NOT NULL,
    "appointmentDate" TIMESTAMP(3),
    "slotStart" TEXT,
    "slotEnd" TEXT,
    "tokenNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientProfileId_fkey" FOREIGN KEY ("patientProfileId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_recurringAvailabilityId_fkey" FOREIGN KEY ("recurringAvailabilityId") REFERENCES "RecurringAvailability"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customAvailabilityId_fkey" FOREIGN KEY ("customAvailabilityId") REFERENCES "CustomAvailability"("id") ON DELETE SET NULL ON UPDATE CASCADE;
