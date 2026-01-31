import { z } from 'zod';

export const searchParamsSchema = z.object({
  max_price: z.number().positive().optional(),
  bedrooms: z.number().int().positive().optional(),
  zone_name: z.string().optional(),
  has_parking: z.boolean().optional(),
  has_pets: z.boolean().optional(),
  smokes: z.boolean().optional(),
  employment_type: z
    .enum([
      'full_time',
      'part_time',
      'contractor',
      'self_employed',
      'unemployed',
      'student',
      'retired',
      'other',
    ])
    .optional(),
  needs_parking: z.boolean().optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

// OpenAI function definition for extracting search parameters
export const searchPropertyFunction = {
  name: 'search_properties',
  description:
    'Busca propiedades de alquiler basándose en los criterios del usuario extraídos del lenguaje natural',
  parameters: {
    type: 'object',
    properties: {
      max_price: {
        type: 'number',
        description: 'Precio máximo de alquiler mensual en dólares',
      },
      bedrooms: {
        type: 'number',
        description: 'Número de habitaciones deseadas',
      },
      zone_name: {
        type: 'string',
        description:
          'Nombre de la zona o barrio (ej: "Providencia", "Centro", "Norte")',
      },
      has_parking: {
        type: 'boolean',
        description: '¿La propiedad debe tener estacionamiento?',
      },
      has_pets: {
        type: 'boolean',
        description: '¿El usuario tiene mascotas?',
      },
      smokes: {
        type: 'boolean',
        description: '¿El usuario fuma?',
      },
      employment_type: {
        type: 'string',
        enum: [
          'full_time',
          'part_time',
          'contractor',
          'self_employed',
          'unemployed',
          'student',
          'retired',
          'other',
        ],
        description: 'Tipo de empleo del usuario',
      },
      needs_parking: {
        type: 'boolean',
        description: '¿El usuario necesita estacionamiento?',
      },
    },
    required: [],
  },
};
