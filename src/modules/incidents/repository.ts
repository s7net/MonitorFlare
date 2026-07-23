import { eq, desc } from 'drizzle-orm';
import type { Database } from '@/shared/database';
import { incidents } from '@/shared/database/schema';
import type { Incident, CreateIncidentDTO } from '@/shared/types';

export class IncidentsRepository {
  constructor(private db: Database) {}

  async createIncident(dto: CreateIncidentDTO): Promise<Incident> {
    const incident: Incident = {
      id: crypto.randomUUID(),
      title: dto.title,
      message: dto.message,
      severity: dto.severity || 'warning',
      isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
      startAt: dto.startAt ? new Date(dto.startAt) : new Date(),
      endAt: dto.endAt ? new Date(dto.endAt) : null,
      createdAt: new Date(),
    };

    await this.db.insert(incidents).values({
      ...incident,
      isActive: incident.isActive,
    });

    return incident;
  }

  async getAllIncidents(): Promise<Incident[]> {
    const rows = await this.db.select().from(incidents).orderBy(desc(incidents.createdAt)).all();
    return rows.map(r => ({
      ...r,
      isActive: Boolean(r.isActive),
    })) as Incident[];
  }

  async getActiveIncidents(): Promise<Incident[]> {
    const rows = await this.db
      .select()
      .from(incidents)
      .where(eq(incidents.isActive, true))
      .orderBy(desc(incidents.createdAt))
      .all();

    return rows.map(r => ({
      ...r,
      isActive: Boolean(r.isActive),
    })) as Incident[];
  }

  async updateIncident(id: string, dto: Partial<CreateIncidentDTO>): Promise<void> {
    const updateData: Record<string, any> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.message !== undefined) updateData.message = dto.message;
    if (dto.severity !== undefined) updateData.severity = dto.severity;
    if (dto.isActive !== undefined) updateData.isActive = Boolean(dto.isActive);
    if (dto.startAt !== undefined) updateData.startAt = new Date(dto.startAt);
    if (dto.endAt !== undefined) updateData.endAt = dto.endAt ? new Date(dto.endAt) : null;

    if (Object.keys(updateData).length > 0) {
      await this.db.update(incidents).set(updateData).where(eq(incidents.id, id));
    }
  }

  async deleteIncident(id: string): Promise<void> {
    await this.db.delete(incidents).where(eq(incidents.id, id));
  }
}
