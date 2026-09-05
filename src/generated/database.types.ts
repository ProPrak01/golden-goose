export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      hey_kivi_runs: {
        Row: {
          created_at: string;
          estimated_cost_usd: number | null;
          id: string;
          input_tokens: number | null;
          latency_ms: number;
          model: string | null;
          outcome: Database['public']['Enums']['assistant_outcome'];
          output_tokens: number | null;
          provider: string;
          reason: string;
          request: string;
          response: string;
          retrieval_run_id: string | null;
        };
        Insert: {
          created_at?: string;
          estimated_cost_usd?: number | null;
          id?: string;
          input_tokens?: number | null;
          latency_ms: number;
          model?: string | null;
          outcome: Database['public']['Enums']['assistant_outcome'];
          output_tokens?: number | null;
          provider?: string;
          reason: string;
          request: string;
          response: string;
          retrieval_run_id?: string | null;
        };
        Update: {
          created_at?: string;
          estimated_cost_usd?: number | null;
          id?: string;
          input_tokens?: number | null;
          latency_ms?: number;
          model?: string | null;
          outcome?: Database['public']['Enums']['assistant_outcome'];
          output_tokens?: number | null;
          provider?: string;
          reason?: string;
          request?: string;
          response?: string;
          retrieval_run_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'hey_kivi_runs_retrieval_run_id_fkey';
            columns: ['retrieval_run_id'];
            isOneToOne: false;
            referencedRelation: 'retrieval_runs';
            referencedColumns: ['id'];
          },
        ];
      };
      memories: {
        Row: {
          canonical_statement: string;
          confidence: number;
          created_at: string;
          expires_at: string | null;
          id: string;
          last_confirmed_at: string;
          memory_type: Database['public']['Enums']['memory_type'];
          occurred_at: string | null;
          payload: Json;
          status: Database['public']['Enums']['memory_status'];
          subject_key: string;
          superseded_by: string | null;
          updated_at: string;
        };
        Insert: {
          canonical_statement: string;
          confidence: number;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          last_confirmed_at?: string;
          memory_type: Database['public']['Enums']['memory_type'];
          occurred_at?: string | null;
          payload?: Json;
          status?: Database['public']['Enums']['memory_status'];
          subject_key?: string;
          superseded_by?: string | null;
          updated_at?: string;
        };
        Update: {
          canonical_statement?: string;
          confidence?: number;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          last_confirmed_at?: string;
          memory_type?: Database['public']['Enums']['memory_type'];
          occurred_at?: string | null;
          payload?: Json;
          status?: Database['public']['Enums']['memory_status'];
          subject_key?: string;
          superseded_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'memories_superseded_by_fkey';
            columns: ['superseded_by'];
            isOneToOne: false;
            referencedRelation: 'memories';
            referencedColumns: ['id'];
          },
        ];
      };
      memory_decisions: {
        Row: {
          created_at: string;
          decision_input: Json;
          estimated_cost_usd: number | null;
          id: string;
          input_tokens: number | null;
          kind: Database['public']['Enums']['decision_kind'];
          latency_ms: number | null;
          memory_id: string | null;
          model: string | null;
          output_tokens: number | null;
          provider: string;
          reason: string;
          transcript_id: string | null;
        };
        Insert: {
          created_at?: string;
          decision_input?: Json;
          estimated_cost_usd?: number | null;
          id?: string;
          input_tokens?: number | null;
          kind: Database['public']['Enums']['decision_kind'];
          latency_ms?: number | null;
          memory_id?: string | null;
          model?: string | null;
          output_tokens?: number | null;
          provider?: string;
          reason: string;
          transcript_id?: string | null;
        };
        Update: {
          created_at?: string;
          decision_input?: Json;
          estimated_cost_usd?: number | null;
          id?: string;
          input_tokens?: number | null;
          kind?: Database['public']['Enums']['decision_kind'];
          latency_ms?: number | null;
          memory_id?: string | null;
          model?: string | null;
          output_tokens?: number | null;
          provider?: string;
          reason?: string;
          transcript_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'memory_decisions_memory_id_fkey';
            columns: ['memory_id'];
            isOneToOne: false;
            referencedRelation: 'memories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'memory_decisions_transcript_id_fkey';
            columns: ['transcript_id'];
            isOneToOne: false;
            referencedRelation: 'transcripts';
            referencedColumns: ['id'];
          },
        ];
      };
      memory_evidence: {
        Row: {
          created_at: string;
          excerpt: string;
          id: string;
          memory_id: string;
          rationale: string;
          source_end: number | null;
          source_start: number | null;
          transcript_id: string;
        };
        Insert: {
          created_at?: string;
          excerpt: string;
          id?: string;
          memory_id: string;
          rationale: string;
          source_end?: number | null;
          source_start?: number | null;
          transcript_id: string;
        };
        Update: {
          created_at?: string;
          excerpt?: string;
          id?: string;
          memory_id?: string;
          rationale?: string;
          source_end?: number | null;
          source_start?: number | null;
          transcript_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'memory_evidence_memory_id_fkey';
            columns: ['memory_id'];
            isOneToOne: false;
            referencedRelation: 'memories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'memory_evidence_transcript_id_fkey';
            columns: ['transcript_id'];
            isOneToOne: false;
            referencedRelation: 'transcripts';
            referencedColumns: ['id'];
          },
        ];
      };
      retrieval_runs: {
        Row: {
          candidates: Json;
          created_at: string;
          filters: Json;
          id: string;
          latency_ms: number;
          query: string;
          rationale: string;
          selected_memory_ids: string[];
          selected_transcript_ids: string[];
        };
        Insert: {
          candidates?: Json;
          created_at?: string;
          filters?: Json;
          id?: string;
          latency_ms: number;
          query: string;
          rationale: string;
          selected_memory_ids?: string[];
          selected_transcript_ids?: string[];
        };
        Update: {
          candidates?: Json;
          created_at?: string;
          filters?: Json;
          id?: string;
          latency_ms?: number;
          query?: string;
          rationale?: string;
          selected_memory_ids?: string[];
          selected_transcript_ids?: string[];
        };
        Relationships: [];
      };
      transcripts: {
        Row: {
          context: Json;
          created_at: string;
          formatted_text: string;
          id: string;
          imported_at: string;
          occurred_at: string;
          raw_asr: string;
          source_app: string | null;
        };
        Insert: {
          context?: Json;
          created_at?: string;
          formatted_text: string;
          id?: string;
          imported_at?: string;
          occurred_at: string;
          raw_asr: string;
          source_app?: string | null;
        };
        Update: {
          context?: Json;
          created_at?: string;
          formatted_text?: string;
          id?: string;
          imported_at?: string;
          occurred_at?: string;
          raw_asr?: string;
          source_app?: string | null;
        };
        Relationships: [];
      };
      user_feedback: {
        Row: {
          action: string;
          created_at: string;
          detail: string | null;
          hey_kivi_run_id: string | null;
          id: string;
          memory_id: string | null;
          replacement_statement: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          detail?: string | null;
          hey_kivi_run_id?: string | null;
          id?: string;
          memory_id?: string | null;
          replacement_statement?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          detail?: string | null;
          hey_kivi_run_id?: string | null;
          id?: string;
          memory_id?: string | null;
          replacement_statement?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_feedback_hey_kivi_run_id_fkey';
            columns: ['hey_kivi_run_id'];
            isOneToOne: false;
            referencedRelation: 'hey_kivi_runs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_feedback_memory_id_fkey';
            columns: ['memory_id'];
            isOneToOne: false;
            referencedRelation: 'memories';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      assistant_outcome: 'answered' | 'clarified' | 'abstained' | 'tool_called';
      decision_kind:
        | 'created'
        | 'updated'
        | 'rejected'
        | 'superseded'
        | 'soft_expired'
        | 'deleted'
        | 'corrected';
      memory_status:
        | 'candidate'
        | 'active'
        | 'superseded'
        | 'soft_expired'
        | 'deleted'
        | 'rejected';
      memory_type: 'fact' | 'preference' | 'episode' | 'pattern';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      assistant_outcome: ['answered', 'clarified', 'abstained', 'tool_called'],
      decision_kind: [
        'created',
        'updated',
        'rejected',
        'superseded',
        'soft_expired',
        'deleted',
        'corrected',
      ],
      memory_status: ['candidate', 'active', 'superseded', 'soft_expired', 'deleted', 'rejected'],
      memory_type: ['fact', 'preference', 'episode', 'pattern'],
    },
  },
} as const;
