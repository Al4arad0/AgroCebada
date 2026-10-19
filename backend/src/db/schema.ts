import { pgTable, uuid, text, doublePrecision, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const parcels = pgTable('parcels', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(), // <-- Restricción única requerida
  state: text('state').notNull(),
  municipality: text('municipality'),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  area: doublePrecision('area'),
  elevation_m: doublePrecision('elevation_m'), // <-- Movido a tabla principal
  slope_deg: doublePrecision('slope_deg'),     // <-- Movido a tabla principal
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const observations = pgTable('observations', {
  id: uuid('id').defaultRandom().primaryKey(),
  parcelId: uuid('parcel_id').references(() => parcels.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull(),
  variables: jsonb('variables').notNull(),
  observedYield: doublePrecision('observed_yield'),
  yieldUnit: text('yield_unit').default('t/ha').notNull(),
  cycle: text('cycle'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const predictions = pgTable('predictions', {
  id: uuid('id').defaultRandom().primaryKey(),
  parcelId: uuid('parcel_id').references(() => parcels.id, { onDelete: 'cascade' }).notNull(),
  predictionDate: timestamp('prediction_date').defaultNow().notNull(),
  predictedYield: doublePrecision('predicted_yield').notNull(),
  unit: text('unit').default('t/ha').notNull(),
  modelId: text('model_id').notNull(),
  modelVersion: text('model_version').notNull(),
  featuresSnapshot: jsonb('features_snapshot'), // <-- Guarda qué variables usó el modelo en vivo
  lowerBound: doublePrecision('lower_bound'),
  upperBound: doublePrecision('upper_bound'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // <-- Índice único para permitir UPSERT y evitar duplicados de un mismo modelo en una parcela
  parcelModelUnqIdx: uniqueIndex('parcel_model_unq_idx').on(table.parcelId, table.modelId)
}));

export const parcelsRelations = relations(parcels, ({ many }) => ({
  observations: many(observations),
  predictions: many(predictions),
}));

export const observationsRelations = relations(observations, ({ one }) => ({
  parcel: one(parcels, {
    fields: [observations.parcelId],
    references: [parcels.id],
  }),
}));

export const predictionsRelations = relations(predictions, ({ one }) => ({
  parcel: one(parcels, {
    fields: [predictions.parcelId],
    references: [parcels.id],
  }),
}));