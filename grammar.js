module.exports = grammar({
  name: 'portugues_puro',

  extras: $ => [
    /[\s\u00A0]/, // Espaços em branco e espaço rígido
    $.comentario
  ],

  conflicts: $ => [
    // Conflitos podem ser adicionados aqui conforme necessário
  ],

  rules: {
    // Regra raiz
    source_file: $ => repeat(choice(
      $.tipo,
      $.variavel_global,
      $.rotina
    )),

    // ===== TOKENS BÁSICOS =====
    palavra: $ => /[a-zA-ZÀ-ÖØ-öø-ÿ]+/,
    numero_inteiro: $ => /\d+/,
    apostrofo: $ => "'",
    aspas_duplas: $ => '"',
    hifen: $ => '-',
    cifrao: $ => '$',
    barra_inclinada: $ => '/',

    // ===== ELEMENTOS GRAMATICAIS =====
    // Artigos
    artigo: $ => choice($.artigo_definido, $.artigo_indefinido),
    artigo_definido: $ => choice(
      'o', 'a', 'os', 'as',
      'este', 'esta', 'estes', 'estas'
    ),
    artigo_indefinido: $ => choice(
      'um', 'uma', 'uns', 'umas',
      'esse', 'essa', 'esses', 'essas'
    ),

    // Contrações (precisarão de um scanner externo para melhor tratamento)
    contracoes: $ => choice(
      'ao', 'à', 'aos', 'às',
      'no', 'na', 'nos', 'nas',
      'pelo', 'pela', 'pelos', 'pelas',
      'num', 'numa', 'nuns', 'numas',
      $.atribuidores_de_posse,
      $.p1, $.p2
    ),
    atribuidores_de_posse: $ => choice('dum', 'duma', 'duns', 'dumas'),
    p1: $ => choice('desse', 'dessa', 'desses', 'dessas'),
    p2: $ => choice('deste', 'desta', 'destes', 'destas'),

    // Possessivos
    possessivo: $ => seq($.palavra, $.apostrofo),
    possessivo_antigo: $ => seq("'s", choice(
      $.nome, 'função', 'conteúdo', 'magnitude', 'endereçamento'
    )),

    // ===== DECLARAÇÕES =====
    tipo: $ => choice(
      seq(
        field('artigo', $.artigo_indefinido),
        field('nome', $.palavra),
        'é',
        field('tipo_artigo', $.artigo_indefinido),
        field('tipo_nome', $.palavra),
        optional($.informacao_opcional),
        '.'
      ),
      seq(
        field('artigo', $.artigo_indefinido),
        field('nome', $.palavra),
        'é uma estrutura com',
        field('campos', $.campos),
        '.'
      ),
      seq(
        field('artigo', $.artigo_indefinido),
        field('nome', $.palavra),
        'é',
        field('valor', $.numero_inteiro),
        field('tipo_nome', $.palavra),
        '.'
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

    // ===== EXPRESSÕES =====
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

    // ===== ROTINAS =====
    rotina: $ => choice(
      $.procedimento,
      $.decisor,
      $.funcao,
      $.retroinvocacao
    ),

    procedimento: $ => seq(
      optional('Rotina'),
      'para que se',
      field('nome', $.nome_da_rotina),
      choice(';', ':'),
      field('instrucoes', $.instrucoes)
    ),

    // ===== COMANDOS =====
    instrucoes: $ => repeat1($.instrucao),
    instrucao: $ => choice(
      $.preservacao,
      $.iteracao,
      $.condicional,
      seq($.incondicional, ',')
    ),

    condicional: $ => seq(
      'Se',
      field('condicao', $.expressao_decisora),
      ',',
      field('acao', $.incondicional),
      repeat(seq(';', $.incondicional)),
      '.'
    ),

    // ===== ELEMENTOS LÉXICOS =====
    comentario: $ => choice(
      $.comentario_de_linha,
      $.comentario_de_bloco
    ),

    comentario_de_linha: $ => seq(
      '\\',
      repeat(/[^\r\n]/),
      '\n'
    ),

    comentario_de_bloco: $ => seq(
      '[',
      repeat(/[^\]]/),
      ']'
    ),

    string_literal: $ => seq(
      '"',
      repeat(choice(
        /[^"\\]/,
        seq('\\', /./)
      )),
      '"'
    ),

    // ===== PALAVRAS RESERVADAS =====
    palavras_reservadas: $ => token(choice(
      'Se', 'Itere', 'Reitere', 'Pare', 'Retorne',
      'Preserve', 'Diga', 'sim', 'não', 'original',
      'Decodifique', 'Processe', 'retornando', 'Push',
      'Pop', 'nulo', 'vazio', 'inexistente'
    )),

    operadores_comuns: $ => choice(
      'mais', 'menos', 'vezes', 'multiplicado por',
      'dividido por', 'junto com', 'seguido de',
      'acompanhado de'
    ),

    // ===== TIPOS PRIMITIVOS =====
    tipos_primitivos: $ => choice(
      'byte', 'caractere', 'word', 'número',
      'sinalizador', 'ponteiro', 'estrutura',
      'string', 'subtexto', 'texto hexadecimal',
      'lista', 'lista estruturada', 'listas',
      'proporção', 'fração', 'numerador', 'denominador'
    )
  }
});
