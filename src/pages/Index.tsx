import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/FileUpload";
import { MetricCard } from "@/components/MetricCard";
import { PacingChart } from "@/components/PacingChart";
import { ComparisonChart } from "@/components/ComparisonChart";
import { RadarChart } from "@/components/RadarChart";
import {
  SwimmingTest,
  sampleData,
  computeIndices,
  computeReferencePattern,
  getSplits,
  getTotalTime,
  semaforoIDG,
  semaforoICF,
  semaforoISM,
  semaforoCVt,
  classifyProfile,
  generateDiagnosis,
  computeRadarValues,
} from "@/lib/swimmingAnalytics";
import { Activity, TrendingUp, Users } from "lucide-react";

const Index = () => {
  const [tests, setTests] = useState<SwimmingTest[]>(sampleData);
  const [selectedAthlete, setSelectedAthlete] = useState<string>("");
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [compareAthlete1, setCompareAthlete1] = useState<string>("");
  const [compareTest1, setCompareTest1] = useState<string>("");
  const [compareAthlete2, setCompareAthlete2] = useState<string>("");
  const [compareTest2, setCompareTest2] = useState<string>("");

  const referencePattern = useMemo(() => computeReferencePattern(tests), [tests]);

  const athletes = useMemo(() => {
    return Array.from(new Set(tests.map((t) => t.athlete))).sort();
  }, [tests]);

  const getTestsForAthlete = (athlete: string) => {
    return tests.filter((t) => t.athlete === athlete);
  };

  const getTestLabel = (test: SwimmingTest) => {
    return `${test.date} – ${test.event}`;
  };

  const currentTest = useMemo(() => {
    if (!selectedAthlete || !selectedTest) return null;
    const athleteTests = getTestsForAthlete(selectedAthlete);
    return athleteTests.find((t) => getTestLabel(t) === selectedTest) || null;
  }, [selectedAthlete, selectedTest, tests]);

  const currentIndices = useMemo(() => {
    if (!currentTest) return null;
    return computeIndices(currentTest, referencePattern);
  }, [currentTest, referencePattern]);

  const compareTest1Data = useMemo(() => {
    if (!compareAthlete1 || !compareTest1) return null;
    const athleteTests = getTestsForAthlete(compareAthlete1);
    return athleteTests.find((t) => getTestLabel(t) === compareTest1) || null;
  }, [compareAthlete1, compareTest1, tests]);

  const compareTest2Data = useMemo(() => {
    if (!compareAthlete2 || !compareTest2) return null;
    const athleteTests = getTestsForAthlete(compareAthlete2);
    return athleteTests.find((t) => getTestLabel(t) === compareTest2) || null;
  }, [compareAthlete2, compareTest2, tests]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Dashboard de Pacing e Fadiga</h1>
          </div>
          <p className="text-lg opacity-90">
            Análise avançada de parciais de 25m em provas/testes de 200m livre
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="individual">
              <TrendingUp className="h-4 w-4 mr-2" />
              Análise Individual
            </TabsTrigger>
            <TabsTrigger value="compare">
              <Users className="h-4 w-4 mr-2" />
              Comparar
            </TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
          </TabsList>

          {/* Individual Analysis Tab */}
          <TabsContent value="individual" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Selecionar teste</CardTitle>
                <CardDescription>Escolha um atleta e um teste para análise detalhada</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Atleta</label>
                  <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um atleta" />
                    </SelectTrigger>
                    <SelectContent>
                      {athletes.map((athlete) => (
                        <SelectItem key={athlete} value={athlete}>
                          {athlete}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Teste</label>
                  <Select
                    value={selectedTest}
                    onValueChange={setSelectedTest}
                    disabled={!selectedAthlete}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um teste" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedAthlete &&
                        getTestsForAthlete(selectedAthlete).map((test) => (
                          <SelectItem key={getTestLabel(test)} value={getTestLabel(test)}>
                            {getTestLabel(test)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {currentTest && currentIndices && (
              <>
                {/* Summary Card */}
                <Card className="shadow-card bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{currentTest.athlete}</span>
                      <Badge variant="outline" className="text-base">
                        {getTotalTime(currentTest).toFixed(2)}s
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {currentTest.date} • {currentTest.event}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Pacing Chart */}
                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <PacingChart
                      data={getSplits(currentTest).map((time, idx) => ({
                        lap: idx + 1,
                        time,
                      }))}
                      athleteName={currentTest.athlete}
                    />
                  </CardContent>
                </Card>

                {/* Metrics Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="IDG"
                    value={`${currentIndices.IDG.toFixed(2)}%`}
                    emoji={semaforoIDG(currentIndices.IDG).emoji}
                    description={semaforoIDG(currentIndices.IDG).description}
                    variant={
                      currentIndices.IDG <= 5
                        ? "success"
                        : currentIndices.IDG <= 8
                        ? "warning"
                        : "destructive"
                    }
                  />
                  <MetricCard
                    title="ICF"
                    value={`${currentIndices.ICF.toFixed(2)}%`}
                    emoji={semaforoICF(currentIndices.ICF).emoji}
                    description={semaforoICF(currentIndices.ICF).description}
                    variant={
                      currentIndices.ICF <= 3
                        ? "success"
                        : currentIndices.ICF <= 6
                        ? "warning"
                        : "destructive"
                    }
                  />
                  <MetricCard
                    title="ISM"
                    value={`${currentIndices.ISM.toFixed(2)}%`}
                    emoji={semaforoISM(currentIndices.ISM).emoji}
                    description={semaforoISM(currentIndices.ISM).description}
                    variant={
                      currentIndices.ISM <= 3
                        ? "success"
                        : currentIndices.ISM <= 6
                        ? "warning"
                        : "destructive"
                    }
                  />
                  <MetricCard
                    title="CV_t"
                    value={`${currentIndices.CV_t.toFixed(2)}%`}
                    emoji={semaforoCVt(currentIndices.CV_t).emoji}
                    description={semaforoCVt(currentIndices.CV_t).description}
                    variant={
                      currentIndices.CV_t <= 2.0
                        ? "success"
                        : currentIndices.CV_t <= 3.5
                        ? "warning"
                        : "destructive"
                    }
                  />
                </div>

                {/* Profile & Diagnosis */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Perfil do atleta</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="mb-3 text-base px-4 py-2">
                        {classifyProfile(currentIndices).profile}
                      </Badge>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {classifyProfile(currentIndices).description}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Diagnóstico automático</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {generateDiagnosis(currentIndices)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Radar Chart */}
                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <RadarChart
                      data={[
                        { category: "Estabilidade", value: computeRadarValues(currentIndices).stability },
                        { category: "Desaceleração global", value: computeRadarValues(currentIndices).globalDeceleration },
                        { category: "Final de prova", value: computeRadarValues(currentIndices).finalPerformance },
                        { category: "Equilíbrio 100/100", value: computeRadarValues(currentIndices).balance },
                        { category: "Conformidade padrão", value: computeRadarValues(currentIndices).patternCompliance },
                      ]}
                      title="Radar de perfil de prova (0-100)"
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Teste A</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Atleta</label>
                    <Select value={compareAthlete1} onValueChange={setCompareAthlete1}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um atleta" />
                      </SelectTrigger>
                      <SelectContent>
                        {athletes.map((athlete) => (
                          <SelectItem key={athlete} value={athlete}>
                            {athlete}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Teste</label>
                    <Select
                      value={compareTest1}
                      onValueChange={setCompareTest1}
                      disabled={!compareAthlete1}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um teste" />
                      </SelectTrigger>
                      <SelectContent>
                        {compareAthlete1 &&
                          getTestsForAthlete(compareAthlete1).map((test) => (
                            <SelectItem key={getTestLabel(test)} value={getTestLabel(test)}>
                              {getTestLabel(test)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Teste B</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Atleta</label>
                    <Select value={compareAthlete2} onValueChange={setCompareAthlete2}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um atleta" />
                      </SelectTrigger>
                      <SelectContent>
                        {athletes.map((athlete) => (
                          <SelectItem key={athlete} value={athlete}>
                            {athlete}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Teste</label>
                    <Select
                      value={compareTest2}
                      onValueChange={setCompareTest2}
                      disabled={!compareAthlete2}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um teste" />
                      </SelectTrigger>
                      <SelectContent>
                        {compareAthlete2 &&
                          getTestsForAthlete(compareAthlete2).map((test) => (
                            <SelectItem key={getTestLabel(test)} value={getTestLabel(test)}>
                              {getTestLabel(test)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {compareTest1Data && compareTest2Data && (
              <>
                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <ComparisonChart
                      data={getSplits(compareTest1Data).map((time, idx) => ({
                        lap: idx + 1,
                        athlete1: time,
                        athlete2: getSplits(compareTest2Data)[idx],
                      }))}
                      athlete1Name={`${compareTest1Data.athlete} – ${compareTest1Data.date}`}
                      athlete2Name={`${compareTest2Data.athlete} – ${compareTest2Data.date}`}
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Índices comparados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-semibold">Teste</th>
                            <th className="text-right py-2 font-semibold">Tempo total</th>
                            <th className="text-right py-2 font-semibold">IDG</th>
                            <th className="text-right py-2 font-semibold">ICF</th>
                            <th className="text-right py-2 font-semibold">ISM</th>
                            <th className="text-right py-2 font-semibold">CV_t</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">{`${compareTest1Data.athlete} – ${compareTest1Data.date}`}</td>
                            <td className="text-right">{getTotalTime(compareTest1Data).toFixed(2)}s</td>
                            <td className="text-right">
                              {computeIndices(compareTest1Data, referencePattern).IDG.toFixed(2)}%
                            </td>
                            <td className="text-right">
                              {computeIndices(compareTest1Data, referencePattern).ICF.toFixed(2)}%
                            </td>
                            <td className="text-right">
                              {computeIndices(compareTest1Data, referencePattern).ISM.toFixed(2)}%
                            </td>
                            <td className="text-right">
                              {computeIndices(compareTest1Data, referencePattern).CV_t.toFixed(2)}%
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2">{`${compareTest2Data.athlete} – ${compareTest2Data.date}`}</td>
                            <td className="text-right">{getTotalTime(compareTest2Data).toFixed(2)}s</td>
                            <td className="text-right">
                              {computeIndices(compareTest2Data, referencePattern).IDG.toFixed(2)}%
                            </td>
                            <td className="text-right">
                              {computeIndices(compareTest2Data, referencePattern).ICF.toFixed(2)}%
                            </td>
                            <td className="text-right">
                              {computeIndices(compareTest2Data, referencePattern).ISM.toFixed(2)}%
                            </td>
                            <td className="text-right">
                              {computeIndices(compareTest2Data, referencePattern).CV_t.toFixed(2)}%
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Diferença percentual por lap (B vs A)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {getSplits(compareTest1Data).map((time1, idx) => {
                        const time2 = getSplits(compareTest2Data)[idx];
                        const diff = ((time2 - time1) / time1) * 100;
                        return (
                          <div key={idx} className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Lap {idx + 1}</div>
                            <div
                              className={`text-lg font-bold ${
                                diff > 0 ? "text-destructive" : diff < 0 ? "text-success" : ""
                              }`}
                            >
                              {diff > 0 ? "+" : ""}
                              {diff.toFixed(1)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <FileUpload onDataLoaded={setTests} />

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Dados carregados</CardTitle>
                <CardDescription>
                  {tests.length} teste(s) de {athletes.length} atleta(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold">Atleta</th>
                        <th className="text-left py-2 font-semibold">Data</th>
                        <th className="text-left py-2 font-semibold">Evento</th>
                        <th className="text-right py-2 font-semibold">Tempo total</th>
                        <th className="text-right py-2 font-semibold">t1-t8</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.map((test, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2">{test.athlete}</td>
                          <td className="py-2">{test.date}</td>
                          <td className="py-2">{test.event}</td>
                          <td className="text-right">{getTotalTime(test).toFixed(2)}s</td>
                          <td className="text-right text-xs text-muted-foreground">
                            {getSplits(test)
                              .map((s) => s.toFixed(1))
                              .join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Padrão de referência</CardTitle>
                <CardDescription>Parciais normalizados médios (p_i = t_i / T)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {referencePattern.map((val, idx) => (
                    <div key={idx} className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Lap {idx + 1}</div>
                      <div className="text-base font-semibold">{val.toFixed(4)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
