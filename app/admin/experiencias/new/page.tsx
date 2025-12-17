import React from 'react';
import { ExperienceForm } from '@/components/custom/ExperienceForm';

export default function NewExperiencePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Cargar Nueva Experiencia</h1>
      <ExperienceForm />
    </div>
  );
}
