module.exports = grammar({
  name: 'portugues_puro',

  extras: $ => [
    /\s/, // Espaços em branco
    $.comentario
  ],

  conflicts: $ => [
    // Podemos adicionar conflitos conhecidos aqui
  ],

  rules: {
    // Regra raiz
    source_file: $ => repeat($._declaracao),

    _declaracao: $ => choice(
      $.tipo,
      $.variavel_global,
      $.rotina
    ),

    // --- Tokens básicos ---
    palavra: $ => /[a-zA-ZŔ-ÖŘ-öř-˙]+/,
    numero_inteiro: $ => /\d+/,
    apostrofo: $ => "'",
    aspas_duplas: $ => '"',
    
    // --- Artigos e palavras reservadas ---
    artigo_definido: $ => choice(
      'o', 'a', 'os', 'as',
      'este', 'esta', 'estes', 'estas'
    ),
    
    artigo_indefinido: $ => choice(
      'um', 'uma', 'uns', 'umas',
      'esse', 'essa', 'esses', 'essas'
    ),

    // --- Estruturas de declaração ---
    tipo: $ => seq(
      field('artigo', $.artigo_indefinido),
      field('nome', $.palavra),
      'é',
      choice(
        seq(
          field('tipo_artigo', $.artigo_indefinido),
          field('tipo_nome', $.palavra),
          optional($.informacao_opcional),
          '.'
        ),
        seq(
          'uma estrutura com',
          field('campos', $.campos),
          '.'
        ),
        seq(
          field('valor', $.numero_inteiro),
          field('tipo_nome', $.palavra),
          '.'
        )
      )
    ),

    campos: $ => seq(
      $.campo,
      repeat(seq($.pausa, $.campo))
    ),

    campo: $ => seq(
      choice(
        $.artigo_indefinido,
        seq($.numero_inteiro, 'bytes')
      ),
      optional(choice(
        seq($.denominacoes, $.palavra),
        seq('sob', $.artigo_definido, $.palavra),
        '(referência)'
      ))
    ),

    // --- Expressões e termos ---
    expressao: $ => seq(
      $.termo,
      repeat(seq($.operadores_comuns, $.termo))
    ),

    termo: $ => choice(
      seq('-', $.termo),
      seq('+', $.termo),
      $.variavel_local,
      $.variavel,
      seq(
        $.termo_literal,
        optional(seq('como', $.artigo_indefinido, $.palavra)),
        optional(seq('/', $.termo))
      )
    ),

    // --- Comentários ---
    comentario: $ => choice(
      $.comentario_de_linha,
      $.comentario_de_bloco
    ),

    comentario_de_linha: $ => seq(
      '\\',
      repeat(/./),
      '\n'
    ),

    comentario_de_bloco: $ => seq(
      '[',
      repeat(/./),
      ']'
    ),

    // --- Palavras reservadas e operadores ---
    palavras_reservadas: $ => choice(
      'Se', 'Itere', 'Reitere', 'Pare', 'Retorne', 
      'Preserve', 'Diga', 'sim', 'não', 'original',
      'Decodifique', 'Processe', 'retornando', 'Push',
      'Pop', 'nulo', 'vazio', 'inexistente'
    ),

    operadores_comuns: $ => choice(
      'mais', 'menos', 'vezes', 'multiplicado por',
      'dividido por', 'junto com', 'seguido de',
      'acompanhado de'
    )
  }
});